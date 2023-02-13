#include "Camera.hpp"

namespace gps {

    //Camera constructor
    Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp) {
        // Update the parameters of the constructor
        this->cameraPosition = cameraPosition;
        this->cameraTarget = cameraTarget;
        this->cameraUp = cameraUp;
        cameraFrontDirection = glm::normalize(cameraTarget - cameraPosition); // to go forward
        cameraRightDirection = glm::normalize(glm::cross(cameraFrontDirection, cameraUp)); // to go right
        cameraUpDirection = glm::normalize(glm::cross(cameraRightDirection, cameraFrontDirection)); // to go up
    }

    //return the view matrix, using the glm::lookAt() function
    glm::mat4 Camera::getViewMatrix() {
        //return glm::mat4();
        return glm::lookAt(cameraPosition, cameraTarget, cameraUpDirection);
    }

    //update the camera internal parameters following a camera move event
    void Camera::move(MOVE_DIRECTION direction, float speed) {
        // Compute the directions

        glm::vec3 norm1, norm2, norm3, norm4;

        switch (direction)
        {
        case gps::MOVE_FORWARD:
            norm1 = glm::normalize(cameraTarget - cameraPosition);
            cameraPosition += norm1*(speed);
            norm2 = glm::normalize(cameraTarget - cameraPosition);
            cameraTarget += norm2*(speed);
            break;
        case gps::MOVE_BACKWARD:
            norm3 = glm::normalize(cameraTarget - cameraPosition);
            cameraPosition -= norm3*(speed);
            norm4 = glm::normalize(cameraTarget - cameraPosition);
            cameraTarget -= norm4*(speed);
            break;
        case gps::MOVE_RIGHT:
            cameraPosition += cameraRightDirection*(speed);
            cameraTarget += cameraRightDirection*(speed);
            break;
        case gps::MOVE_LEFT:
            cameraPosition -= (cameraRightDirection)* (speed);
            cameraTarget -= (cameraRightDirection)* (speed);
            break;
        default:
            break;
        }
    }

    void Camera::rotate(float pitch, float yaw) {
        // Rotate the camera 
        glm::mat3 m = glm::yawPitchRoll(yaw, pitch, 0.0f);
        glm::vec3 v = -glm::normalize(m * cameraFrontDirection);
        glm::vec3 product = glm::cross(v, glm::vec3(0.0f, 1.0f, 0.0f));
        cameraRightDirection = -glm::normalize(product);

        cameraUpDirection = glm::cross(v, cameraRightDirection);
        cameraTarget = cameraPosition + (-v);
    }
}