package grp25.captcha.tag;


import javafx.scene.paint.Color;

/**
 * The interface for different tags of patches.
 */
public interface Tag {
    /**
     * Get the number of different tags (e.g. 2 for binary tag).
     *
     * @return The number of different tags
     */
    int getSize();

    /**
     * Get the next tag. It should be circular: get the exact tag beck after
     * calling this function several times.
     *
     * @return The next tag.
     */
    Tag next();

    /**
     * Get the color representing this tag.
     *
     * @return The color representing this tag.
     */
    Color getColor();
}
