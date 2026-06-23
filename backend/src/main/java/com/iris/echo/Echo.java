package com.iris.echo;

import com.iris.bloom.Bloom;
import com.iris.garden.GardenItem;
import com.iris.listener.Listener;

import java.util.ArrayList;
import java.util.List;

public class Echo {

    private String id;
    private String code;
    private List<Listener> listeners = new ArrayList<>();
    private List<GardenItem> garden = new ArrayList<>();
    private Bloom currentBloom;
    private boolean playing;
    private double position;
    private long updatedAt;
    private String conductorId;

    public Echo() {
    }

    public Echo(String id, String code, String conductorId) {
        this.id = id;
        this.code = code;
        this.conductorId = conductorId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public List<Listener> getListeners() {
        return listeners;
    }

    public void setListeners(List<Listener> listeners) {
        this.listeners = listeners;
    }

    public List<GardenItem> getGarden() {
        return garden;
    }

    public void setGarden(List<GardenItem> garden) {
        this.garden = garden;
    }

    public Bloom getCurrentBloom() {
        return currentBloom;
    }

    public void setCurrentBloom(Bloom currentBloom) {
        this.currentBloom = currentBloom;
    }

    public boolean isPlaying() {
        return playing;
    }

    public void setPlaying(boolean playing) {
        this.playing = playing;
    }

    public double getPosition() {
        return position;
    }

    public void setPosition(double position) {
        this.position = position;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(long updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getConductorId() {
        return conductorId;
    }

    public void setConductorId(String conductorId) {
        this.conductorId = conductorId;
    }
}
