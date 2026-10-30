package com.aisdlc.pm.waiver;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class WaiverController {
    public record Decision(boolean approve, String comment) { }
    public record Closure(String outcome) { }

    private final WaiverService waivers;
    public WaiverController(WaiverService waivers) { this.waivers = waivers; }

    @GetMapping("/projects/{projectId}/waivers") public List<Waiver> list(@PathVariable String projectId) { return waivers.list(projectId); }
    @PostMapping("/projects/{projectId}/waivers") public Waiver request(@PathVariable String projectId, @RequestBody Waiver w) { return waivers.request(w, projectId); }
    @GetMapping("/waivers/{id}") public Waiver get(@PathVariable String id) { return waivers.get(id); }
    @PostMapping("/waivers/{id}/decision") public Waiver decide(@PathVariable String id, @RequestBody Decision d) { return waivers.decide(id, d.approve(), d.comment()); }
    @PostMapping("/waivers/{id}/close") public Waiver close(@PathVariable String id, @RequestBody(required = false) Closure c) { return waivers.close(id, c == null ? null : c.outcome()); }
    @GetMapping("/waivers/conditions") public List<String> waivable(@RequestParam(required = false) String unused) { return WaiverService.WAIVABLE.stream().sorted().toList(); }
}
