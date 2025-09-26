<?php
class Database {
    private $host = "localhost";
    private $db_name = "icms_db";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            // Fail silently; callers should handle a null connection and respond with JSON
            $this->conn = null;
        }

        return $this->conn;
    }

    // Accessors for credentials (used by backup/restore tools)
    public function getHost() {
        return $this->host;
    }

    public function getDatabaseName() {
        return $this->db_name;
    }

    public function getUsername() {
        return $this->username;
    }

    public function getPassword() {
        return $this->password;
    }
}
?> 