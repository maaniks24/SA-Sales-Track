package com.aisdlc.pm.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;
import java.util.EnumSet;
import java.util.Set;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("users")
public class User {
    @Id public String id;
    @Indexed(unique = true) public String username;
    public String fullName;
    public String email;
    @JsonIgnore public String passwordHash;
    public Set<Role> roles = EnumSet.noneOf(Role.class);
    public boolean active = true;
    public Instant createdAt;
    public Instant lastLoginAt;

    public boolean has(Role r) { return roles != null && (roles.contains(r) || roles.contains(Role.ADMIN)); }
}
