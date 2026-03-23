CREATE TABLE DietPlanLogEntry (
    id INT (10) UNSIGNED NOT NULL AUTO_INCREMENT,
    dietPlanId INT (10) UNSIGNED NOT NULL,
    clientId INT (10) UNSIGNED NOT NULL,
    logDate DATE NOT NULL,
    calories INT NOT NULL,
    protein INT NOT NULL,
    carbs INT NOT NULL,
    fats INT NOT NULL,
    PRIMARY KEY (id),
    KEY `DietPlanLogEntry_dietPlan_FK` (dietPlanId),
    KEY `DietPlanLogEntry_client_FK` (clientId),
    CONSTRAINT `DietPlanLogEntry_dietPlan_FK` FOREIGN KEY (dietPlanId) REFERENCES DietPlan (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `DietPlanLogEntry_client_FK` FOREIGN KEY (clientId) REFERENCES Client (id) ON DELETE CASCADE ON UPDATE CASCADE
)