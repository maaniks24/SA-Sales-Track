package com.aisdlc.pm.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.common.SystemEventService;
import com.aisdlc.pm.gate.GateApprovedEvent;
import com.aisdlc.pm.integration.bugzilla.BugzillaClient;
import com.aisdlc.pm.integration.bugzilla.BugzillaService;
import com.aisdlc.pm.project.Project;
import com.aisdlc.pm.project.ProjectService;
import com.aisdlc.pm.workitem.WorkItem;
import com.aisdlc.pm.workitem.WorkItemRepository;
import com.aisdlc.pm.workitem.WorkItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BugzillaResolveOnG9Test {
    BugzillaClient client = mock(BugzillaClient.class);
    ProjectService projects = mock(ProjectService.class);
    WorkItemRepository repo = mock(WorkItemRepository.class);
    WorkItemService items = mock(WorkItemService.class);
    BugzillaService service = new BugzillaService(client, projects, repo, items, mock(IntegrationEventService.class), mock(SystemEventService.class), mock(AuditService.class));
    Project p = new Project();
    WorkItem w = new WorkItem();

    @BeforeEach
    void setUp() {
        p.id = "p1"; p.key = "FAS";
        p.integrations.bugzilla.enabled = true; p.integrations.bugzilla.baseUrl = "https://bz"; p.integrations.bugzilla.resolveOnClose = true;
        w.key = "FAS-3"; w.projectId = "p1"; w.type = WorkItem.Type.SR; w.srKind = WorkItem.SrKind.DEFECT; w.processId = "BUG-DEP-001";
        WorkItem.BugRef open = new WorkItem.BugRef(); open.id = 10; open.status = "ASSIGNED";
        WorkItem.BugRef done = new WorkItem.BugRef(); done.id = 11; done.status = "VERIFIED";
        w.bugs.add(open); w.bugs.add(done);
        when(projects.get("p1")).thenReturn(p);
        when(items.get("FAS-3")).thenReturn(w);
    }

    @Test
    void g9ResolvesOpenLinkedBugsOnly() {
        service.onGateApproved(new GateApprovedEvent("p1", "FAS-3", "S9"));
        verify(client).resolve(any(), eq(10L), anyString());
        verify(client, never()).resolve(any(), eq(11L), anyString());
        assertThat(w.bugs.get(0).status).isEqualTo("RESOLVED");
        verify(repo).save(w);
    }

    @Test
    void otherGatesAndDisabledSettingDoNothing() {
        service.onGateApproved(new GateApprovedEvent("p1", "FAS-3", "S5"));
        p.integrations.bugzilla.resolveOnClose = false;
        service.onGateApproved(new GateApprovedEvent("p1", "FAS-3", "S9"));
        verify(client, never()).resolve(any(), anyLong(), anyString());
    }
}
