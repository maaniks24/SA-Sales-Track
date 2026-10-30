package com.aisdlc.pm.sprint;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("sprints")
public class Sprint {
    public enum Status { PLANNED, ACTIVE, CLOSED }

    @Id public String id;
    @Indexed public String projectId;
    public String name;
    public String goal;
    public LocalDate start;
    public LocalDate end;
    public Integer capacity;
    public Status status = Status.PLANNED;
    public List<BurnPoint> burndown = new ArrayList<>();
    public Instant createdAt;
    public Instant closedAt;

    public static class BurnPoint {
        public LocalDate date;
        public int remaining;
        public int completed;
        public BurnPoint() { }
        public BurnPoint(LocalDate date, int remaining, int completed) { this.date = date; this.remaining = remaining; this.completed = completed; }
    }
}
