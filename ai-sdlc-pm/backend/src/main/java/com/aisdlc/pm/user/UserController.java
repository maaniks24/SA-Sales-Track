package com.aisdlc.pm.user;

import com.aisdlc.pm.user.AuthController.UserView;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Set;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    public record CreateUser(@NotBlank String username, @NotBlank String fullName, String email, @NotBlank String password, Set<Role> roles) { }
    public record UpdateUser(String fullName, String email, Set<Role> roles, Boolean active) { }
    public record ChangePassword(@NotBlank String currentPassword, @NotBlank String newPassword) { }

    private final UserService users;
    public UserController(UserService users) { this.users = users; }

    @GetMapping
    public List<UserView> list() { return users.list().stream().map(UserView::of).toList(); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserView create(@Valid @RequestBody CreateUser r) { return UserView.of(users.create(r.username(), r.fullName(), r.email(), r.password(), r.roles())); }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserView update(@PathVariable String id, @RequestBody UpdateUser r) { return UserView.of(users.update(id, r.fullName(), r.email(), r.roles(), r.active())); }

    @PostMapping("/me/password")
    public void changePassword(@Valid @RequestBody ChangePassword r) { users.changePassword(r.currentPassword(), r.newPassword()); }
}
