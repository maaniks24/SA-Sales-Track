package com.aisdlc.pm.workitem;

import com.aisdlc.pm.audit.AuditEvent;
import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.gate.GateEvaluation;
import com.aisdlc.pm.gate.GateService;
import com.aisdlc.pm.user.UserService;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class WorkItemController {
    public record Applicability(boolean applicable, String reason) { }
    public record Check(boolean checked, String evidence) { }
    public record AiUsage(String aiUsage, String aiOperator, Integer unresolvedAssumptions) { }
    public record Decision(String decision, String comment, String reviewer) { }
    public record Move(WorkItem.Column column, Double rank, String reason) { }
    public record RequirementLink(String reqId) { }

    private final WorkItemService items;
    private final GateService gates;
    private final BoardService board;
    private final UserService users;
    private final AuditService audit;

    public WorkItemController(WorkItemService items, GateService gates, BoardService board, UserService users, AuditService audit) {
        this.items = items; this.gates = gates; this.board = board; this.users = users; this.audit = audit;
    }

    @GetMapping("/projects/{projectId}/work-items")
    public List<WorkItem> list(@PathVariable String projectId, @RequestParam(required = false) String type, @RequestParam(required = false) String column,
                               @RequestParam(required = false) String assignee, @RequestParam(required = false) String sprintId, @RequestParam(required = false) String q) {
        return items.list(projectId, type, column, assignee, sprintId, q);
    }

    @PostMapping("/projects/{projectId}/work-items")
    public WorkItem create(@PathVariable String projectId, @RequestBody WorkItemService.CreateWorkItem r) { return items.create(projectId, r); }

    @GetMapping("/projects/{projectId}/board")
    public List<BoardService.ColumnView> board(@PathVariable String projectId, @RequestParam(required = false) String sprintId) { return board.board(projectId, sprintId); }

    @GetMapping("/projects/{projectId}/approvals")
    public List<BoardService.Approval> approvals(@PathVariable String projectId, @RequestParam(defaultValue = "true") boolean mine) { return board.approvals(projectId, mine); }

    @GetMapping("/work-items/{key}") public WorkItem get(@PathVariable String key) { return items.get(key); }
    @PutMapping("/work-items/{key}") public WorkItem update(@PathVariable String key, @RequestBody WorkItemService.UpdateWorkItem r) { return items.update(key, r); }
    @PostMapping("/work-items/{key}/move") public BoardService.Card move(@PathVariable String key, @RequestBody Move m) { return board.card(board.move(key, m.column(), m.rank(), m.reason())); }
    @GetMapping("/work-items/{key}/activity") public List<AuditEvent> activity(@PathVariable String key) { return audit.forWorkItem(key.toUpperCase()); }

    @PostMapping("/work-items/{key}/stages/{stageId}/start") public WorkItem start(@PathVariable String key, @PathVariable String stageId) { return items.startStage(key, stageId); }
    @PostMapping("/work-items/{key}/stages/{stageId}/applicability")
    public WorkItem applicability(@PathVariable String key, @PathVariable String stageId, @RequestBody Applicability a) { return items.setApplicable(key, stageId, a.applicable(), a.reason()); }
    @PutMapping("/work-items/{key}/stages/{stageId}/checklist/{index}")
    public WorkItem check(@PathVariable String key, @PathVariable String stageId, @PathVariable int index, @RequestBody Check c) { return items.check(key, stageId, index, c.checked(), c.evidence()); }
    @PutMapping("/work-items/{key}/stages/{stageId}/ai")
    public WorkItem ai(@PathVariable String key, @PathVariable String stageId, @RequestBody AiUsage a) { return items.setAiUsage(key, stageId, a.aiUsage(), a.aiOperator(), a.unresolvedAssumptions()); }

    @GetMapping("/work-items/{key}/stages/{stageId}/gate")
    public GateEvaluation gate(@PathVariable String key, @PathVariable String stageId) { return gates.evaluate(items.get(key), stageId, users.current()); }
    @PostMapping("/work-items/{key}/stages/{stageId}/submit")
    public WorkItem submit(@PathVariable String key, @PathVariable String stageId) { return gates.submit(items.get(key), stageId); }
    @PostMapping("/work-items/{key}/stages/{stageId}/decision")
    public WorkItem decide(@PathVariable String key, @PathVariable String stageId, @RequestBody Decision d) { return gates.decide(items.get(key), stageId, d.decision(), d.comment(), d.reviewer()); }

    @PostMapping("/work-items/{key}/requirements")
    public WorkItem link(@PathVariable String key, @RequestBody RequirementLink r) { return items.linkRequirement(key, r.reqId(), true); }
    @DeleteMapping("/work-items/{key}/requirements/{reqId}")
    public WorkItem unlink(@PathVariable String key, @PathVariable String reqId) { return items.linkRequirement(key, reqId, false); }
}
