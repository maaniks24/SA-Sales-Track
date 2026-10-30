package com.aisdlc.pm.common;

import java.util.List;
import org.springframework.data.domain.Page;

public record PageResult<T>(List<T> items, int page, int size, long total) {
    public static <T> PageResult<T> of(Page<T> p) { return new PageResult<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements()); }
}
