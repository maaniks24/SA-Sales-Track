package com.aisdlc.pm.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import de.bwaldvogel.mongo.MongoServer;
import de.bwaldvogel.mongo.backend.h2.H2Backend;
import de.bwaldvogel.mongo.backend.memory.MemoryBackend;
import java.io.File;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Starts an in-process MongoDB-compatible server for local development and tests, so the API runs
 * without installing MongoDB. Enabled with app.mongo.embedded=true; production connects to MongoDB
 * through spring.mongodb.uri instead and this configuration is not loaded.
 */
@Configuration
@ConditionalOnProperty(name = "app.mongo.embedded", havingValue = "true")
public class EmbeddedMongoConfig {
    private static final Logger log = LoggerFactory.getLogger(EmbeddedMongoConfig.class);

    @Bean(destroyMethod = "shutdown")
    MongoServer embeddedMongoServer(AppProperties props) {
        String file = props.mongo().embeddedFile();
        MongoServer server;
        if (file == null || file.isBlank()) {
            server = new MongoServer(new MemoryBackend());
        } else {
            File f = new File(file);
            if (f.getParentFile() != null) f.getParentFile().mkdirs();
            server = new MongoServer(new H2Backend(f.getPath()));
        }
        server.bind("127.0.0.1", 0);
        log.info("Embedded MongoDB-compatible server on {} ({})", server.getLocalAddress(), file == null || file.isBlank() ? "in-memory" : file);
        return server;
    }

    @Bean(destroyMethod = "close")
    MongoClient mongoClient(MongoServer server) {
        return MongoClients.create("mongodb://" + server.getLocalAddress().getHostString() + ":" + server.getLocalAddress().getPort());
    }
}
