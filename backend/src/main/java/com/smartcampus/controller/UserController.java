package com.smartcampus.controller;

import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all users (Admin only)
    @GetMapping
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        // Fetch user from DB using OAuth email
        String email = principal.getAttribute("email");
        Optional<User> requesterOpt = userRepository.findByEmail(email);
        
        if (requesterOpt.isEmpty() || requesterOpt.get().getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Forbidden: Only Admin can access users");
        }

        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // Update user role (Admin only)
    @PatchMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal OAuth2User principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String email = principal.getAttribute("email");
        Optional<User> requesterOpt = userRepository.findByEmail(email);

        if (requesterOpt.isEmpty() || requesterOpt.get().getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Forbidden: Only Admin can change roles");
        }

        String roleName = request.get("role");
        if (roleName == null) {
            return ResponseEntity.badRequest().body("Role is required");
        }

        Role newRole;
        try {
            newRole = Role.valueOf(roleName.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role");
        }

        Optional<User> targetUserOpt = userRepository.findById(id);
        if (targetUserOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User targetUser = targetUserOpt.get();
        
        // Prevent admin from accidentally demoting themselves via this endpoint 
        // if they are the only admin. (Though to keep it simple we just let them change roles)
        targetUser.setRole(newRole);
        userRepository.save(targetUser);

        return ResponseEntity.ok(targetUser);
    }
}
