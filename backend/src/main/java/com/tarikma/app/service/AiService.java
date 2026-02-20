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
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);
    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    private final String apiKey;
    private final HttpClient httpClient;

    public AiService(@Value("${app.ai.groq-api-key:}") String apiKey) {
        this.apiKey = apiKey;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Sends a prompt to Groq and returns the assistant's text response.
     */
    public String chatCompletion(String systemPrompt, String userPrompt) throws Exception {
        if (!isConfigured()) {
            throw new IllegalStateException("Groq API key is not configured");
        }

        String jsonBody = """
                {
                  "model": "llama-3.3-70b-versatile",
                  "temperature": 0.2,
                  "max_tokens": 10000,
                  "messages": [
                    {"role": "system", "content": %s},
                    {"role": "user", "content": %s}
                  ]
                }
                """.formatted(escapeJsonString(systemPrompt), escapeJsonString(userPrompt));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GROQ_URL))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Groq API error {}: {}", response.statusCode(), response.body());
            throw new RuntimeException("AI service returned status " + response.statusCode());
        }

        return extractContent(response.body());
    }

    private static String escapeJsonString(String value) {
        return "\"" + value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t")
                + "\"";
    }

    private static String extractContent(String json) {
        // Extract "content" value from the first choice's message
        String marker = "\"content\"";
        int idx = json.indexOf("\"choices\"");
        if (idx < 0) throw new RuntimeException("No choices in AI response");

        idx = json.indexOf(marker, idx);
        if (idx < 0) throw new RuntimeException("No content in AI response");

        // Skip past "content" : "
        idx = json.indexOf(':', idx) + 1;
        while (idx < json.length() && json.charAt(idx) == ' ') idx++;

        if (json.charAt(idx) == '"') {
            return parseJsonStringValue(json, idx);
        }
        throw new RuntimeException("Unexpected content format in AI response");
    }

    private static String parseJsonStringValue(String json, int startQuote) {
        StringBuilder sb = new StringBuilder();
        int i = startQuote + 1;
        while (i < json.length()) {
            char c = json.charAt(i);
            if (c == '\\' && i + 1 < json.length()) {
                char next = json.charAt(i + 1);
                switch (next) {
                    case '"' -> sb.append('"');
                    case '\\' -> sb.append('\\');
                    case 'n' -> sb.append('\n');
                    case 'r' -> sb.append('\r');
                    case 't' -> sb.append('\t');
                    default -> { sb.append('\\'); sb.append(next); }
                }
                i += 2;
            } else if (c == '"') {
                return sb.toString();
            } else {
                sb.append(c);
                i++;
            }
        }
        throw new RuntimeException("Unterminated string in AI response");
    }
}
