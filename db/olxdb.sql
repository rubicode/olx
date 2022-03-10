--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.4
-- Dumped by pg_dump version 9.6.4

-- Started on 2022-03-10 14:21:50 WIB

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 12655)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2423 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 190 (class 1259 OID 104418)
-- Name: ads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE ads (
    id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    category integer NOT NULL,
    seller integer NOT NULL,
    price numeric NOT NULL,
    pictures text[] NOT NULL,
    approved boolean DEFAULT false NOT NULL
);


--
-- TOC entry 189 (class 1259 OID 104416)
-- Name: ads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE ads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2424 (class 0 OID 0)
-- Dependencies: 189
-- Name: ads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE ads_id_seq OWNED BY ads.id;


--
-- TOC entry 188 (class 1259 OID 104410)
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


--
-- TOC entry 187 (class 1259 OID 104408)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2425 (class 0 OID 0)
-- Dependencies: 187
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE categories_id_seq OWNED BY categories.id;


--
-- TOC entry 186 (class 1259 OID 104399)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE users (
    id integer NOT NULL,
    fullname character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20),
    pass character varying(100) NOT NULL,
    avatar text,
    isadmin boolean DEFAULT false NOT NULL
);


--
-- TOC entry 185 (class 1259 OID 104397)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2426 (class 0 OID 0)
-- Dependencies: 185
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- TOC entry 2284 (class 2604 OID 104421)
-- Name: ads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY ads ALTER COLUMN id SET DEFAULT nextval('ads_id_seq'::regclass);


--
-- TOC entry 2283 (class 2604 OID 104413)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY categories ALTER COLUMN id SET DEFAULT nextval('categories_id_seq'::regclass);


--
-- TOC entry 2281 (class 2604 OID 104402)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- TOC entry 2416 (class 0 OID 104418)
-- Dependencies: 190
-- Data for Name: ads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY ads (id, title, description, category, seller, price, pictures, approved) FROM stdin;
1	Motors	Motor Bekass	2	5	1100000	{1646378385027-img_mountains_wide.jpeg,1646378871555-img_nature_wide.jpeg,1646378871556-img_snow_wide.jpeg}	t
6	Rumah Baru	Rumah Faiz Baru	3	2	1234	{1646710896240-img_snow_wide.jpeg,1646710896241-img_mountains_wide.jpeg}	t
5	Mobil lama	Mobil bekas	1	5	150000000	{1646708992733-img_snow_wide.jpeg,1646708992735-img_mountains_wide.jpeg}	t
\.


--
-- TOC entry 2427 (class 0 OID 0)
-- Dependencies: 189
-- Name: ads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('ads_id_seq', 6, true);


--
-- TOC entry 2414 (class 0 OID 104410)
-- Dependencies: 188
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY categories (id, name) FROM stdin;
2	Motor
3	Property
4	Elektronik
5	Gadget
1	Mobil
8	Lainnya
\.


--
-- TOC entry 2428 (class 0 OID 0)
-- Dependencies: 187
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('categories_id_seq', 8, true);


--
-- TOC entry 2412 (class 0 OID 104399)
-- Dependencies: 186
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY users (id, fullname, email, phone, pass, avatar, isadmin) FROM stdin;
1	Rubi Henjaya	rubi@gmail.com	\N	$2b$10$85lP1r5G8th3T4wbL14/I.9YsRdqgscjn6S6ZPvH9qVskpgeQJi3e	\N	t
5	Herlan Aprianto	herlan.a@gmail.com	08112237789	$2b$10$mHmLhtf7DRmDh0D7D04Q5eC7/U0ttVher4pKSADDQcn3PBtGVf2Pe	1646219448604-herlan.jpeg	f
2	Faiz	faiz@gmail.com	12345678	$2b$10$l0iEDKZ2cuAztxJmEFRpXeqXYVJpZumj88v/qiGx80LzRJ/V4LrY2	1646713134729-herlan.jpeg	f
\.


--
-- TOC entry 2429 (class 0 OID 0)
-- Dependencies: 185
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('users_id_seq', 5, true);


--
-- TOC entry 2291 (class 2606 OID 104426)
-- Name: ads ads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ads
    ADD CONSTRAINT ads_pkey PRIMARY KEY (id);


--
-- TOC entry 2289 (class 2606 OID 104415)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 2287 (class 2606 OID 104407)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 2292 (class 2606 OID 104427)
-- Name: ads categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ads
    ADD CONSTRAINT categories_fk FOREIGN KEY (category) REFERENCES categories(id);


--
-- TOC entry 2293 (class 2606 OID 104432)
-- Name: ads users_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ads
    ADD CONSTRAINT users_fk FOREIGN KEY (seller) REFERENCES users(id);


-- Completed on 2022-03-10 14:21:50 WIB

--
-- PostgreSQL database dump complete
--

