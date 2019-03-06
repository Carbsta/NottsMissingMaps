package grp25.captcha.tag;

import javafx.scene.paint.Color;


public enum Binary implements Tag {
    HABITABLE    (0, Color.GREEN),
    NON_HABITABLE (1, Color.BLUE);

    private static final int SIZE = 2;
    private final int idx;
    private final Color color;

    Binary(int idx, Color c) {
        this.idx = idx;
        this.color = c;
    }

    @Override
    public int getSize() {
        return SIZE;
    }

    @Override
    public Binary next() {
        return this == HABITABLE ? NON_HABITABLE : HABITABLE;
    }

    public int getIdx() {
        return idx;
    }

    public Color getColor() {
        return color;
    }


    static public Tag getDefault() {
        return NON_HABITABLE;
    }


}
