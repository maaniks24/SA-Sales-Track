package com.aisdlc.pm.dashboard;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {
    private final DashboardService dashboard;
    public DashboardController(DashboardService dashboard) { this.dashboard = dashboard; }

    @GetMapping("/api/projects/{pid}/dashboard")
    public DashboardService.Dashboard get(@PathVariable String pid) { return dashboard.build(pid); }
}
