package com.aisdlc.pm.process;

import com.aisdlc.pm.common.ApiException;
import com.aisdlc.pm.process.ProcessDefinition.StageDef;
import com.aisdlc.pm.process.ProcessDefinition.TemplateDef;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

@Service
public class ProcessService {
    private final ProcessDefinition def;
    private final Map<String, StageDef> stages;
    private final Map<String, String> templateFiles;

    public ProcessService(JsonMapper json) throws IOException {
        try (InputStream in = new ClassPathResource("process/process-definition.json").getInputStream()) {
            this.def = json.readValue(in, ProcessDefinition.class);
        }
        this.stages = def.stages().stream().collect(Collectors.toMap(StageDef::id, Function.identity(), (a, b) -> a, java.util.LinkedHashMap::new));
        Resource[] files = new PathMatchingResourcePatternResolver().getResources("classpath:templates/*");
        this.templateFiles = java.util.Arrays.stream(files).map(Resource::getFilename).filter(f -> f != null && f.length() > 3)
            .collect(Collectors.toMap(f -> f.substring(0, 3), f -> f, (a, b) -> a));
    }

    public ProcessDefinition definition() { return def; }
    public List<StageDef> stages() { return def.stages(); }

    public StageDef stage(String id) {
        StageDef s = stages.get(id);
        if (s == null) throw ApiException.notFound("Stage", id);
        return s;
    }

    public TemplateDef template(String id) {
        return def.templates().stream().filter(t -> t.id().equals(id)).findFirst().orElseThrow(() -> ApiException.notFound("Template", id));
    }

    /** Template file name on the classpath (templates/), e.g. T02 -> T02-SFVD.docx. */
    public String templateFile(String id) {
        String f = templateFiles.get(id);
        if (f == null) throw ApiException.notFound("Template file", id);
        return f;
    }

    public List<String> checklist(String workTypeKey, String stageId) {
        Map<String, List<String>> o = def.checklistOverrides().get(workTypeKey);
        if (o != null && o.containsKey(stageId) && !o.get(stageId).isEmpty()) return o.get(stageId);
        return stage(stageId).checklist();
    }

    public String applicability(String workTypeKey, String stageId) {
        return def.applicability().getOrDefault(workTypeKey, Map.of()).getOrDefault(stageId, "FULL");
    }

    public List<String> requiredDocs(String workTypeKey, String stageId) {
        Map<String, List<String>> r = stage(stageId).requiredDocs();
        return r == null ? List.of() : r.getOrDefault(workTypeKey, List.of());
    }
}
