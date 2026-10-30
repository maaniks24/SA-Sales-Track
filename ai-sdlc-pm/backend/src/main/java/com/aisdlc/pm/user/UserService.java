package com.aisdlc.pm.user;

import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.common.ApiException;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final AuditService audit;

    public UserService(UserRepository repo, PasswordEncoder encoder, AuditService audit) {
        this.repo = repo; this.encoder = encoder; this.audit = audit;
    }

    public User authenticate(String username, String password) {
        User u = repo.findByUsername(username == null ? "" : username.trim().toLowerCase()).orElse(null);
        if (u == null || !u.active || !encoder.matches(password, u.passwordHash)) {
            audit.recordAs(username == null ? "unknown" : username, "LOGIN_FAILED", "USER", username, null, "Sign-in failed", null);
            throw ApiException.unauthorized("The username or password is wrong, or the account is disabled.");
        }
        u.lastLoginAt = Instant.now();
        repo.save(u);
        audit.recordAs(u.username, "LOGIN", "USER", u.id, null, "Signed in", null);
        return u;
    }

    public User current() {
        String name = AuditService.currentActor();
        return repo.findByUsername(name).orElseThrow(() -> ApiException.unauthorized("Your session is no longer valid. Sign in again."));
    }

    public User get(String id) { return repo.findById(id).orElseThrow(() -> ApiException.notFound("User", id)); }
    public User byUsername(String u) { return repo.findByUsername(u).orElse(null); }
    public List<User> list() { return repo.findAll(Sort.by("fullName")); }

    public User create(String username, String fullName, String email, String password, Set<Role> roles) {
        String name = username.trim().toLowerCase();
        if (repo.existsByUsername(name)) throw ApiException.conflict("The username " + name + " is already taken.");
        if (password == null || password.length() < 8) throw ApiException.badRequest("Passwords need at least 8 characters.");
        User u = new User();
        u.username = name; u.fullName = fullName; u.email = email;
        u.passwordHash = encoder.encode(password);
        u.roles = roles == null || roles.isEmpty() ? EnumSet.of(Role.DEVELOPER) : EnumSet.copyOf(roles);
        u.createdAt = Instant.now();
        User saved = repo.save(u);
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            audit.record("USER_CREATED", "USER", saved.id, null, "Created user " + name, Map.of("roles", saved.roles));
        }
        return saved;
    }

    public User update(String id, String fullName, String email, Set<Role> roles, Boolean active) {
        User u = get(id);
        if (fullName != null) u.fullName = fullName;
        if (email != null) u.email = email;
        if (roles != null && !roles.isEmpty()) u.roles = EnumSet.copyOf(roles);
        if (active != null) u.active = active;
        User saved = repo.save(u);
        audit.record("USER_UPDATED", "USER", id, null, "Updated user " + u.username, Map.of("roles", u.roles, "active", u.active));
        return saved;
    }

    public void changePassword(String current, String next) {
        User u = current();
        if (!encoder.matches(current, u.passwordHash)) throw ApiException.badRequest("The current password is wrong.");
        if (next == null || next.length() < 8) throw ApiException.badRequest("Passwords need at least 8 characters.");
        u.passwordHash = encoder.encode(next);
        repo.save(u);
        audit.record("PASSWORD_CHANGED", "USER", u.id, null, "Changed own password", null);
    }
}
