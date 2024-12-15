CREATE TABLE IF NOT EXISTS playing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stationId INT,
    trackId VARCHAR(20),
    artistId VARCHAR(20),
    title VARCHAR(255),
    trackName VARCHAR(255),
    artistName VARCHAR(255),
    trackViewUrl VARCHAR(255),
    artworkURL VARCHAR(255),
    artistImage VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stationId) REFERENCES stations(id)
);