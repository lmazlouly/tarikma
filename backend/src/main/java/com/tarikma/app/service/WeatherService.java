package com.tarikma.app.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);
    private static final String OWM_URL = "https://api.openweathermap.org/data/2.5/forecast";

    private final String apiKey;
    private final HttpClient httpClient;

    public WeatherService(@Value("${app.ai.openweathermap-api-key:}") String apiKey) {
        this.apiKey = apiKey;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Returns a short weather summary for the given city and date.
     * Uses the 5-day forecast API (free tier).
     * Falls back to a generic message if the API is not configured or fails.
     */
    public String getWeatherSummary(String cityName, String dateStr) {
        if (!isConfigured()) {
            return "Weather data unavailable (API key not configured).";
        }

        try {
            String url = OWM_URL + "?q=" + encodeParam(cityName + ",MA")
                    + "&units=metric&cnt=40&appid=" + apiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("OpenWeatherMap API error {}: {}", response.statusCode(), response.body());
                return "Weather data unavailable.";
            }

            return extractForecastSummary(response.body(), dateStr);
        } catch (Exception e) {
            log.warn("Failed to fetch weather for {}: {}", cityName, e.getMessage());
            return "Weather data unavailable.";
        }
    }

    private String extractForecastSummary(String json, String targetDate) {
        // Find forecast entries matching the target date
        // The API returns 3-hour intervals; we look for entries containing the target date
        StringBuilder summary = new StringBuilder();
        int searchFrom = 0;

        double minTemp = Double.MAX_VALUE;
        double maxTemp = Double.MIN_VALUE;
        String mainWeather = null;

        while (true) {
            int listIdx = json.indexOf("\"dt_txt\"", searchFrom);
            if (listIdx < 0) break;

            int colonIdx = json.indexOf(':', listIdx);
            int quoteStart = json.indexOf('"', colonIdx + 1);
            int quoteEnd = json.indexOf('"', quoteStart + 1);
            if (quoteEnd < 0) break;

            String dtTxt = json.substring(quoteStart + 1, quoteEnd);
            searchFrom = quoteEnd + 1;

            if (!dtTxt.startsWith(targetDate)) continue;

            // Find temp_min and temp_max near this entry
            // Look backwards for the nearest "main" block
            int mainBlock = json.lastIndexOf("\"main\"", listIdx);
            if (mainBlock < 0) continue;

            double tempMin = extractDouble(json, "\"temp_min\"", mainBlock, listIdx + 200);
            double tempMax = extractDouble(json, "\"temp_max\"", mainBlock, listIdx + 200);

            if (tempMin < minTemp) minTemp = tempMin;
            if (tempMax > maxTemp) maxTemp = tempMax;

            if (mainWeather == null) {
                int weatherBlock = json.lastIndexOf("\"weather\"", listIdx);
                if (weatherBlock >= 0) {
                    mainWeather = extractStringValue(json, "\"description\"", weatherBlock, listIdx + 300);
                }
            }
        }

        if (minTemp == Double.MAX_VALUE) {
            return "No forecast available for " + targetDate + " (may be beyond 5-day range).";
        }

        summary.append(String.format("Forecast for %s: %.0f–%.0f°C", targetDate, minTemp, maxTemp));
        if (mainWeather != null) {
            summary.append(", ").append(mainWeather);
        }
        return summary.toString();
    }

    private double extractDouble(String json, String key, int from, int to) {
        int idx = json.indexOf(key, from);
        if (idx < 0 || idx > to) return 0;
        int colonIdx = json.indexOf(':', idx);
        int endIdx = colonIdx + 1;
        while (endIdx < json.length() && json.charAt(endIdx) == ' ') endIdx++;
        int numStart = endIdx;
        while (endIdx < json.length() && (Character.isDigit(json.charAt(endIdx)) || json.charAt(endIdx) == '.' || json.charAt(endIdx) == '-')) {
            endIdx++;
        }
        try {
            return Double.parseDouble(json.substring(numStart, endIdx));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private String extractStringValue(String json, String key, int from, int to) {
        int idx = json.indexOf(key, from);
        if (idx < 0 || idx > to) return null;
        int colonIdx = json.indexOf(':', idx);
        int quoteStart = json.indexOf('"', colonIdx + 1);
        int quoteEnd = json.indexOf('"', quoteStart + 1);
        if (quoteEnd < 0) return null;
        return json.substring(quoteStart + 1, quoteEnd);
    }

    private static String encodeParam(String value) {
        return value.replace(" ", "%20");
    }
}
