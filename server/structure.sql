--
-- PostgreSQL database dump
--

-- Dumped from database version 10.8 (Ubuntu 10.8-1.pgdg16.04+1)
-- Dumped by pg_dump version 10.8 (Ubuntu 10.8-1.pgdg16.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: clear_children(character varying); Type: FUNCTION; Schema: public; Owner: jpubuntu
--

CREATE FUNCTION public.clear_children(uid character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
DELETE FROM children WHERE fid = (SELECT id FROM factories WHERE uuid = uid);
RETURN TRUE;
END
$$;


ALTER FUNCTION public.clear_children(uid character varying) OWNER TO jpubuntu;

--
-- Name: erase_children(); Type: FUNCTION; Schema: public; Owner: jpubuntu
--

CREATE FUNCTION public.erase_children() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
	BEGIN
		DELETE FROM children WHERE fid = OLD.id;
		RETURN OLD;
	END;
$$;


ALTER FUNCTION public.erase_children() OWNER TO jpubuntu;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: children; Type: TABLE; Schema: public; Owner: jpubuntu
--

CREATE TABLE public.children (
    id integer NOT NULL,
    fid bigint NOT NULL,
    num integer NOT NULL
);


ALTER TABLE public.children OWNER TO jpubuntu;

--
-- Name: children_id_seq; Type: SEQUENCE; Schema: public; Owner: jpubuntu
--

CREATE SEQUENCE public.children_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.children_id_seq OWNER TO jpubuntu;

--
-- Name: children_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jpubuntu
--

ALTER SEQUENCE public.children_id_seq OWNED BY public.children.id;


--
-- Name: factories; Type: TABLE; Schema: public; Owner: jpubuntu
--

CREATE TABLE public.factories (
    id integer NOT NULL,
    uuid character varying NOT NULL,
    name character varying,
    min integer DEFAULT 0 NOT NULL,
    max integer DEFAULT 1 NOT NULL,
    CONSTRAINT factory_positive_range CHECK ((max >= min))
);


ALTER TABLE public.factories OWNER TO jpubuntu;

--
-- Name: factories_id_seq; Type: SEQUENCE; Schema: public; Owner: jpubuntu
--

CREATE SEQUENCE public.factories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.factories_id_seq OWNER TO jpubuntu;

--
-- Name: factories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jpubuntu
--

ALTER SEQUENCE public.factories_id_seq OWNED BY public.factories.id;


--
-- Name: children id; Type: DEFAULT; Schema: public; Owner: jpubuntu
--

ALTER TABLE ONLY public.children ALTER COLUMN id SET DEFAULT nextval('public.children_id_seq'::regclass);


--
-- Name: factories id; Type: DEFAULT; Schema: public; Owner: jpubuntu
--

ALTER TABLE ONLY public.factories ALTER COLUMN id SET DEFAULT nextval('public.factories_id_seq'::regclass);


--
-- Name: children children_pkey; Type: CONSTRAINT; Schema: public; Owner: jpubuntu
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT children_pkey PRIMARY KEY (id);


--
-- Name: factories factory_id_uniq; Type: CONSTRAINT; Schema: public; Owner: jpubuntu
--

ALTER TABLE ONLY public.factories
    ADD CONSTRAINT factory_id_uniq UNIQUE (id);


--
-- Name: factories factory_uuid_uniq; Type: CONSTRAINT; Schema: public; Owner: jpubuntu
--

ALTER TABLE ONLY public.factories
    ADD CONSTRAINT factory_uuid_uniq UNIQUE (uuid);


--
-- Name: children_fid_idx; Type: INDEX; Schema: public; Owner: jpubuntu
--

CREATE INDEX children_fid_idx ON public.children USING btree (fid);


--
-- Name: factory_name_idx; Type: INDEX; Schema: public; Owner: jpubuntu
--

CREATE INDEX factory_name_idx ON public.factories USING btree (name);


--
-- Name: factory_uuid_idx; Type: INDEX; Schema: public; Owner: jpubuntu
--

CREATE INDEX factory_uuid_idx ON public.factories USING btree (uuid);


--
-- Name: factories wipe_children_then_factory; Type: TRIGGER; Schema: public; Owner: jpubuntu
--

CREATE TRIGGER wipe_children_then_factory BEFORE DELETE ON public.factories FOR EACH ROW EXECUTE PROCEDURE public.erase_children();


--
-- Name: children children_fid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jpubuntu
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT children_fid_fkey FOREIGN KEY (fid) REFERENCES public.factories(id);


--
-- Name: factories factory_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: jpubuntu
--

ALTER TABLE ONLY public.factories
    ADD CONSTRAINT factory_id_fk FOREIGN KEY (id) REFERENCES public.factories(id) MATCH FULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON SCHEMA public TO dev_user;


--
-- Name: FUNCTION erase_children(); Type: ACL; Schema: public; Owner: jpubuntu
--

GRANT ALL ON FUNCTION public.erase_children() TO dev_user;


--
-- Name: TABLE children; Type: ACL; Schema: public; Owner: jpubuntu
--

GRANT ALL ON TABLE public.children TO dev_user;


--
-- Name: SEQUENCE children_id_seq; Type: ACL; Schema: public; Owner: jpubuntu
--

GRANT ALL ON SEQUENCE public.children_id_seq TO dev_user;


--
-- Name: TABLE factories; Type: ACL; Schema: public; Owner: jpubuntu
--

GRANT ALL ON TABLE public.factories TO dev_user;


--
-- Name: SEQUENCE factories_id_seq; Type: ACL; Schema: public; Owner: jpubuntu
--

GRANT ALL ON SEQUENCE public.factories_id_seq TO dev_user;


--
-- PostgreSQL database dump complete
--

