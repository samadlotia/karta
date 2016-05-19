CREATE TABLE Stack (
  key serial PRIMARY KEY,
  name varchar(512)
);

CREATE TABLE Deck (
  key serial PRIMARY KEY,
  stack integer REFERENCES Stack (key),
  name varchar(512)
);

CREATE TABLE Card (
  key serial PRIMARY KEY,
  deck integer REFERENCES Deck (key),
  front text,
  back text,
  score smallint
);
