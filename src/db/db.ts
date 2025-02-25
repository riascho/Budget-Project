/** 

## PSQL table creation

CREATE TABLE ENVELOPES (
    id SERIAL PRIMARY KEY,           -- SERIAL is auto-incrementing integer
    title VARCHAR(100) NOT NULL,     -- VARCHAR with max length instead of string
    budget NUMERIC(10,2) NOT NULL,   -- NUMERIC for precise decimal calculations
    balance NUMERIC(10,2) NOT NULL   -- NUMERIC for precise decimal calculations
);

CREATE TABLE TRANSACTIONS (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,              -- DATE type for date values
    amount NUMERIC(10,2) NOT NULL,   -- NUMERIC for precise decimal calculations
    description TEXT,                -- TEXT for variable-length strings
    envelope_id INTEGER NOT NULL REFERENCES ENVELOPES(id)  -- INTEGER for FK
);
*/
