package com.changrui.mysterious.domain.exception;

import com.changrui.mysterious.domain.model.user.UserId;

/**
 * Exception levée lorsqu'un utilisateur n'est pas trouvé dans le système.
 */
public class UserNotFoundException extends DomainException {

    private static final String ERROR_CODE = "USER_NOT_FOUND";

    public UserNotFoundException(UserId userId) {
        super("User with ID " + userId.value() + " not found");
    }

    public UserNotFoundException(String usernameOrMessage) {
        super(usernameOrMessage.contains(" ") ? usernameOrMessage
                : "User with username '" + usernameOrMessage + "' not found");
    }

    @Override
    public String getErrorCode() {
        return ERROR_CODE;
    }
}
