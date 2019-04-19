package grp25.captcha.tag;

import javafx.scene.paint.Color;

/**
 * The binary tag: inhabitable or not.
 */
public enum Binary implements Tag {
    /**
     * The tag habitable. It will be represented in ImagePatch (a inner class of {@link grp25.captcha.Controller}) with green border.
     */
    HABITABLE(0, Color.GREEN),
    /**
     * The tag non-habitable. It will be represented in ImagePatch (a inner class of {@link grp25.captcha.Controller}) with blue border.
     */
    NON_HABITABLE(1, Color.BLUE);

    private static final int SIZE = 2;
    private final int idx;
    private final Color color;

    Binary(int idx, Color c) {
        this.idx = idx;
        this.color = c;
    }

    /**
     * Give the default {@link Binary} tag.
     *
     * @return The default {@link Binary} tag.
     */
    static public Tag getDefault() {
        return NON_HABITABLE;
    }

    @Override
    public int getSize() {
        return SIZE;
    }

    @Override
    public Binary next() {
        return this == HABITABLE ? NON_HABITABLE : HABITABLE;
    }

    @Override
    public Color getColor() {
        return color;
    }
}
