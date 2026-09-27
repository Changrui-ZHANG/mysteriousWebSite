package com.changrui.mysterious.domain.messagewall;

import static org.junit.jupiter.api.Assertions.*;

import com.changrui.mysterious.domain.messagewall.dto.MessageResponse;
import com.changrui.mysterious.domain.messagewall.model.Message;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

/**
 * The client reads and sends isAnonymous / isVerified; Lombok's boolean getters would otherwise
 * make Jackson use anonymous / verified.
 */
class MessageJsonTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void message_readsAndWritesIsPrefixedBooleans() throws Exception {
        Message m = mapper.readValue("{\"userId\":\"u\",\"message\":\"hi\",\"isAnonymous\":true,\"isVerified\":true}",
                Message.class);
        assertTrue(m.isAnonymous());
        assertTrue(m.isVerified());

        JsonNode json = mapper.valueToTree(m);
        assertTrue(json.get("isAnonymous").asBoolean());
        assertTrue(json.get("isVerified").asBoolean());
        assertFalse(json.has("anonymous"));
        assertFalse(json.has("verified"));
    }

    @Test
    void messageResponse_writesIsPrefixedBooleans() {
        MessageResponse r = new MessageResponse();
        r.setAnonymous(true);
        JsonNode json = mapper.valueToTree(r);
        assertTrue(json.get("isAnonymous").asBoolean());
        assertFalse(json.get("isVerified").asBoolean());
        assertFalse(json.has("anonymous"));
        assertFalse(json.has("verified"));
    }
}
