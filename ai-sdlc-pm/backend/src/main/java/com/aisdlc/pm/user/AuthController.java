package com.aisdlc.pm.user;

import com.aisdlc.pm.config.AppProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    public record LoginRequest(@NotBlank String username, @NotBlank String password) { }
    public record UserView(String id, String username, String fullName, String email, Set<Role> roles) {
        static UserView of(User u) { return new UserView(u.id, u.username, u.fullName, u.email, u.roles); }
    }
    public record LoginResponse(String token, Instant expiresAt, UserView user) { }

    private final UserService users;
    private final JwtEncoder encoder;
    private final AppProperties props;

    public AuthController(UserService users, JwtEncoder encoder, AppProperties props) { this.users = users; this.encoder = encoder; this.props = props; }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        User u = users.authenticate(req.username(), req.password());
        Instant now = Instant.now(), exp = now.plus(props.jwt().ttlHours(), ChronoUnit.HOURS);
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("ai-sdlc-pm").subject(u.username).issuedAt(now).expiresAt(exp)
            .claim("uid", u.id).claim("name", u.fullName).claim("roles", u.roles.stream().map(Enum::name).toList()).build();
        String token = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new LoginResponse(token, exp, UserView.of(u));
    }

    @GetMapping("/me")
    public UserView me() { return UserView.of(users.current()); }
}
