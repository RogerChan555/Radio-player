CREATE TABLE IF NOT EXISTS tracks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stationId INT,
    trackId VARCHAR(20),
    artistId VARCHAR(20),
    trackName VARCHAR(255),
    artistName VARCHAR(255),
    trackViewUrl VARCHAR(255),
    artworkURL VARCHAR(255),
    FOREIGN KEY (stationId) REFERENCES stations(id)
);