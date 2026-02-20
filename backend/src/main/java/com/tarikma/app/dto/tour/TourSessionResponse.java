package com.tarikma.app.dto.tour;

import java.time.Instant;

public class TourSessionResponse {

    private Long id;
    private Instant startDateTime;
    private Instant endDateTime;
    private Integer maxParticipants;
    private long bookedCount;
    private int availablePlaces;
    private String status;
    private boolean userBooked;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Instant getStartDateTime() { return startDateTime; }
    public void setStartDateTime(Instant startDateTime) { this.startDateTime = startDateTime; }

    public Instant getEndDateTime() { return endDateTime; }
    public void setEndDateTime(Instant endDateTime) { this.endDateTime = endDateTime; }

    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public long getBookedCount() { return bookedCount; }
    public void setBookedCount(long bookedCount) { this.bookedCount = bookedCount; }

    public int getAvailablePlaces() { return availablePlaces; }
    public void setAvailablePlaces(int availablePlaces) { this.availablePlaces = availablePlaces; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isUserBooked() { return userBooked; }
    public void setUserBooked(boolean userBooked) { this.userBooked = userBooked; }
}
