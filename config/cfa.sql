CREATE SCHEMA `cfa` ;

create table ApplianceClass
(
    classID       smallint(3) auto_increment
        primary key,
    applianceName char(40) null comment 'Common Name for Appliance Class'
);

create table Brigade
(
    brigadeID       smallint(7) not null
        primary key,
    brigadeName     char(100)   not null,
    brigadeAddress  char(100)   null,
    brigadeLocation point       null comment 'GEOM Point Location of Brigade',
    constraint brigade_brigade_id_uindex
        unique (brigadeID)
);

create table Appliance
(
    applianceID    int auto_increment
        primary key,
    brigadeID      smallint(7) not null,
    publicName     char(255)   null comment 'Public Facing name for appliance (ie. Basin Tanker 1)',
    applianceClass smallint(3) null comment 'Type of Appliance',
    constraint Appliance_ApplianceClass_classID_fk
        foreign key (applianceClass) references ApplianceClass (classID),
    constraint Appliance_Brigade_brigadeID_fk
        foreign key (brigadeID) references Brigade (brigadeID)
);

create table Permission
(
    permissionID          int       not null
        primary key,
    permissionName        char(20)  null,
    permissionDescription char(255) null comment 'Brief description of permission level',
    constraint Permission_permissionID_uindex
        unique (permissionID)
);

create table User
(
    userID          int auto_increment
        primary key,
    userName        char(255)     not null,
    permissionLevel int default 1 not null,
    memberID        int(8)        null comment 'Operational Membership or Employee Number (if any)',
    constraint User_Permission_permissionID_fk
        foreign key (permissionLevel) references Permission (permissionID)
);

create table UserBrigadeBridge
(
    userID    int         not null,
    brigadeID smallint(7) not null,
    primary key (userID, brigadeID),
    constraint UserBrigadeBridge_Brigade_brigadeID_fk
        foreign key (brigadeID) references Brigade (brigadeID),
    constraint UserBrigadeBridge_User_userID_fk
        foreign key (userID) references User (userID)
);

create table CampaignStatus
(
    statusID          smallint  not null
        primary key,
    statusDescription char(100) not null,
    constraint CampaignStatus_statusID_uindex
        unique (statusID)
);

create table Campaign
(
    campaignID     int auto_increment
        primary key,
    campaignName   char(255)   null comment 'Name of Campaign (Public Facing)',
    leadBrigade    smallint(7) null comment 'Lead Brigade responsible for Campaign',
    campaignStart  datetime    null,
    campaignEnd    datetime    null,
    campaignNotes  char        null,
    campaignStatus smallint    not null,
    constraint Campaign_Brigade_brigadeID_fk
        foreign key (leadBrigade) references Brigade (brigadeID),
    constraint Campaign_CampaignStatus_statusID_fk
        foreign key (campaignStatus) references CampaignStatus (statusID)
);

create table Route
(
    routeID    int auto_increment comment 'Primary key that allocates for each route.'
        primary key,
    campaignID int          null,
    routeName  varchar(45)  null comment 'Common name for operational reference - recommended NATO Alpha',
    routeGeom  geometry     null comment 'Geometry object(s) for the planned route.',
    routeNote  varchar(100) null comment 'Any additional notes for this route for the Driver to be mindful of?',
    constraint idRoutes_UNIQUE
        unique (routeID),
    constraint Route_Campaign_campaignID_fk
        foreign key (campaignID) references Campaign (campaignID)
)
    comment 'Geom Data Table that contains geom data points for routes.';

create table RouteRecord
(
    sessionID    varchar(255) not null comment '''UUID or similar that is parsed from the app so an appliance can read/write to it\\''s own record.'''
        primary key,
    userID       int(8)       not null comment '''Who is writing this record.''',
    applianceID  int          not null,
    timeStart    timestamp    not null comment 'When did this broadcast start?\n',
    lastUpdate   timestamp    null,
    timeEnd      timestamp    null,
    recordedGeom geometry     null,
    routeID      int          not null,
    campaignID   int          not null,
    constraint sessionID_UNIQUE
        unique (sessionID),
    constraint RouteRecord_Appliance_applianceID_fk
        foreign key (applianceID) references Appliance (applianceID),
    constraint RouteRecord_Campaign_campaignID_fk
        foreign key (campaignID) references Campaign (campaignID),
    constraint RouteRecord_Route_routeID_fk
        foreign key (routeID) references Route (routeID),
    constraint RouteRecord_User_userID_fk
        foreign key (userID) references User (userID)
)
    comment 'Records the movements of Appliances during a Campaign';

create table CampaignApplianceBridge
(
    campaignID  int null,
    applianceID int null,
    constraint CampaignApplianceBridge_Appliance_applianceID_fk
        foreign key (applianceID) references Appliance (applianceID),
    constraint CampaignApplianceBridge_Campaign_campaignID_fk
        foreign key (campaignID) references Campaign (campaignID)
);