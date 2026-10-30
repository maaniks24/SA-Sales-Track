package com.aisdlc.pm;

import static org.assertj.core.api.Assertions.assertThat;

import com.aisdlc.pm.common.SequenceService;
import com.aisdlc.pm.user.Role;
import com.aisdlc.pm.user.User;
import com.aisdlc.pm.user.UserRepository;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.EnumSet;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.test.context.ActiveProfiles;

/** Guards the development set-up: the in-process server must support what the application relies on. */
@SpringBootTest
@ActiveProfiles("test")
class EmbeddedMongoCompatibilityTest {
    @Autowired UserRepository users;
    @Autowired SequenceService sequences;
    @Autowired GridFsTemplate gridFs;

    @Test
    void repositoriesCountersAndGridFsWork() throws Exception {
        User u = new User();
        u.username = "compat"; u.fullName = "Compat"; u.roles = EnumSet.of(Role.DEVELOPER);
        users.save(u);
        assertThat(users.findByUsername("compat")).isPresent();

        long a = sequences.next("test-seq"), b = sequences.next("test-seq");
        assertThat(b).isEqualTo(a + 1);

        ObjectId id = gridFs.store(new ByteArrayInputStream("hello".getBytes(StandardCharsets.UTF_8)), "hello.txt", "text/plain");
        var file = gridFs.findOne(Query.query(Criteria.where("_id").is(id)));
        assertThat(new String(gridFs.getResource(file).getInputStream().readAllBytes(), StandardCharsets.UTF_8)).isEqualTo("hello");
    }
}
