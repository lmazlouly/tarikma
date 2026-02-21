package com.tarikma.app.dto.guide;

import java.math.BigDecimal;

public class GuideDashboardSummary {

    private long totalBookings;
    private long confirmedBookings;
    private long pendingBookings;
    private BigDecimal totalRevenue;
    private long totalTourists;
    private long totalCircuits;
    private long upcomingSessions;

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }

    public long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(long confirmedBookings) { this.confirmedBookings = confirmedBookings; }

    public long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(long pendingBookings) { this.pendingBookings = pendingBookings; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getTotalTourists() { return totalTourists; }
    public void setTotalTourists(long totalTourists) { this.totalTourists = totalTourists; }

    public long getTotalCircuits() { return totalCircuits; }
    public void setTotalCircuits(long totalCircuits) { this.totalCircuits = totalCircuits; }

    public long getUpcomingSessions() { return upcomingSessions; }
    public void setUpcomingSessions(long upcomingSessions) { this.upcomingSessions = upcomingSessions; }
}
