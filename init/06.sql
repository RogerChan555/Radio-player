CREATE TABLE IF NOT EXISTS advertisements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    refUrl VARCHAR(255),
    thumbnail VARCHAR(255),
    imageUrl VARCHAR(255),
    iFrameUrl VARCHAR(255),
    googleSlotId VARCHAR(255)
);
