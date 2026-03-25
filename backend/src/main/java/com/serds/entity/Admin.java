package com.serds.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "admins")
public class Admin extends BaseUser {
    private String department = "GENERAL_ADMINISTRATION";

    public Admin() {}

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
