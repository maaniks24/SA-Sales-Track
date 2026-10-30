package com.aisdlc.pm.common;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Identifier formats from the process definition (section 8.2) and how to find them in free text. */
public final class Ids {
    public static final Pattern REQ = Pattern.compile("\\b([A-Z]{2,5}-REQ-\\d{3}(?:\\.r\\d+)?)\\b");
    public static final Pattern CR = Pattern.compile("\\b(CR-\\d{4}-\\d{3})\\b");
    public static final Pattern SR = Pattern.compile("\\b(SR-\\d{4}-\\d{5})\\b");
    public static final Pattern BUG = Pattern.compile("\\b(BUG-[A-Z]{2,5}-\\d{3,})\\b");
    public static final Pattern WORK_ITEM = Pattern.compile("\\b([A-Z][A-Z0-9]{1,9}-\\d{1,6})\\b");

    private Ids() { }

    public static Set<String> find(Pattern p, String text) {
        Set<String> out = new LinkedHashSet<>();
        if (text == null) return out;
        Matcher m = p.matcher(text);
        while (m.find()) out.add(m.group(1));
        return out;
    }

    /** A commit or branch is valid when it carries at least one process ID (REQ, CR, SR, BUG) or a work item key. */
    public static boolean hasProcessId(String text, Set<String> knownWorkItemKeys) {
        if (!find(REQ, text).isEmpty() || !find(CR, text).isEmpty() || !find(SR, text).isEmpty() || !find(BUG, text).isEmpty()) return true;
        return find(WORK_ITEM, text).stream().anyMatch(knownWorkItemKeys::contains);
    }
}
