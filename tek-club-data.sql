--
-- PostgreSQL database dump
--

\restrict ayU8A9Y7CVz4fJQ82xKDAJvf4KgwaLuPyInPBt7g5OVeLItEm895YRUWlxJIT7I

-- Dumped from database version 16.13 (Homebrew)
-- Dumped by pg_dump version 16.13 (Homebrew)

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
-- Data for Name: account_recovery_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account_recovery_codes (account_recovery_code_id, purpose, code_hash, university_id, username_norm, expires_at, used_at, attempt_count, created_at) FROM stdin;
cmp27nceg000cq948dfclbns5	REVEAL_USERNAME	28bcac3f5e3ba5160a88afe50413b333cffd191600d82de10ef638f5473c679e	u1554965	\N	2026-05-12 06:04:07.335	\N	0	2026-05-12 05:49:07.336
cmp3p9qn00000q9ybq27e447i	PASSWORD_RESET	d980659b04beb3221e9012a0f2b0e9175fe7faff2b8d5edf9c459cc29c6db514	u1554965	kojh0518	2026-05-13 07:05:11.867	\N	0	2026-05-13 06:50:11.868
\.


--
-- Data for Name: applicants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.applicants (university_id, first_name, last_name, email) FROM stdin;
\.


--
-- Data for Name: meetings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meetings (meeting_id, title, scheduled_at, type, location, notes) FROM stdin;
cmp14rylr0000q9y6kqlqm57d	TEK Demo Day	2026-05-13 08:00:00	SHOWCASE	U104	RSVP Link to reserve your spot: https://docs.google.com/forms/d/e/1FAIpQLSfja1_Y9lwdRvQWsIqSeWY5cH-021e8P2O23mWCWJcLv38gdg/viewform?usp=dialog\n\nDinners will be served to the ones who rsvp.\n\nDr. Chong Oh attending from the Main Campus!!
cmp2gw7ip000dq96ov5jl9u62	IS & Business AI Info Session	2026-05-13 03:00:00	SHOWCASE	U402	\N
cmp3smhur0001q9ybagoxr6ok	Info session	2026-05-15 08:23:00	GENERAL	U107	\N
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.members (member_id, university_id, email, first_name, last_name, password_hash, join_date, membership_status, member_type, username) FROM stdin;
cmp15xnse0000q901a4tp9tji	u1554965	u1554965@utah.edu	Jung	Ko	$2b$10$mZrAqsDIX95e4ajz73waN.Z3BLJVhk5mxVTdwjOV78LLP3pRIepxG	2026-05-11 12:13:23.246	ACTIVE	OFFICER	kojh0518
cmp28boia0000q98zxcgqc1n1	U6037366	Byoung-Gyu.Gong@utah.edu	Byoung-gyu	Gong	$2b$10$2pY8achQJnKSgFFgpIm14eCkUIV2M5og0hofTNPLEm7nz7y9ghZl2	2026-05-12 06:08:02.77	ACTIVE	OFFICER	gong4000
\.


--
-- Data for Name: attendance_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance_records (meeting_id, member_id, attendance_status, recorded_at) FROM stdin;
\.


--
-- Data for Name: labs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.labs (lab_id, lab_name, description, objective, created_at) FROM stdin;
cmovij8wm0001q94cua2etagy	Excel Lab	Spreadsheet engineering, financial modeling, and business analytics with Excel and Google Sheets.	Build practical spreadsheet fluency and ship reusable templates the whole club can use.	2026-05-07 13:19:28.727
cmovij8wp0002q94cb2qr1efk	Stock Lab	Stock price prediction and algorithmic trading — quantitative research, backtesting, and live paper trading.	Design, backtest, and ship at least one trading strategy each semester.	2026-05-07 13:19:28.73
cmovij8wq0003q94c2lozp2rt	Fitness App Lab	Mobile and web fitness applications — workout tracking, nutrition, wearables integration.	Ship a polished fitness app to real users by end of the academic year.	2026-05-07 13:19:28.731
cmovij8wr0004q94clw553fgo	AI Contents Lab	AI content creation tools — generative video, image, copy, and multimodal pipelines.	Prototype creator-facing AI tooling and publish demos / open-source experiments.	2026-05-07 13:19:28.731
cmovij8wr0005q94ck6x1wvrw	Student Scheduler Lab	A college student scheduling platform — class planning, study sessions, and group coordination.	Launch a scheduling product real students on campus actually use.	2026-05-07 13:19:28.732
cmovij8ws0006q94cgcpg1jra	Startup Accelerator Lab	Platform for early-stage student startups — pitches, mentorship matching, milestones, and funding workflows.	Build the operating system for the campus startup ecosystem.	2026-05-07 13:19:28.732
cmp2hlrk50002q9dyrrxtw8jp	Foreigner Assistance Service Development	I would like to create a web portal where I could collect foreigners difficulties and address them.	By the end of 2026, I would like to help out 10 foreigners (living in Korea) through this website.	2026-05-12 10:27:49.829
\.


--
-- Data for Name: bulletin_board; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bulletin_board (post_id, author_id, title, content, pinned, posted_at, lab_id) FROM stdin;
cmp27e92v000bq948kihx5gn1	cmp15xnse0000q901a4tp9tji	Demo Day Event	We are hosting a Demo Day event this Wednesday (13th). All club members should join. Dinner will be provided if you rsvp on time. RSVP link is in the meeting page so make sure you check it out.\n\nJung	f	2026-05-12 05:42:03.127	\N
cmp29cfqx000iq948amsdyn1o	cmp28boia0000q98zxcgqc1n1	Information Systems & Business AI Info Session	Good Afternoon everyone,\n\nWe are also hosting an Info Session for IS & Business AI on Wednesday lunch. Extra credits for IS Class will be given to the ones who attend this and the Demo Day event mentioned above.\n\nRSVP Link is posted in UAC Business group chat.\n\nProf. Gong	f	2026-05-12 06:36:37.684	\N
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_messages (message_id, sender_id, receiver_id, content, sent_at, read_at) FROM stdin;
\.


--
-- Data for Name: visitors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.visitors (visitor_id, ip_address, browser_type, visited_at) FROM stdin;
cmp16jea10000q9az9cpb87g3	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15	2026-05-11 12:30:17.353
cmp174p4r0003q9azz6gfyk8o	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15	2026-05-11 12:46:51.196
cmp177ye30006q9azix4ovgnb	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15	2026-05-11 12:49:23.164
cmp26qn0z0000q948z0hkcijm	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15	2026-05-12 05:23:41.459
cmp26yqs60004q948fyak4cqk	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15	2026-05-12 05:29:59.575
cmp27u8sl000dq9485evnn7pu	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15	2026-05-12 05:54:29.253
cmp2aripn000jq948iegxpume	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15	2026-05-12 07:16:20.987
cmp2eker20000q96oymz1gwwe	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15	2026-05-12 09:02:47.727
\.


--
-- Data for Name: club_applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.club_applications (club_app_id, applicant_id, visitor_id, major, coding_experience, status, submitted_at, account_setup_token) FROM stdin;
\.


--
-- Data for Name: club_officers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.club_officers (member_id, admin_access_level, officer_role) FROM stdin;
cmp15xnse0000q901a4tp9tji	5	PRESIDENT
cmp28boia0000q98zxcgqc1n1	5	SUPERVISOR
\.


--
-- Data for Name: gallery_photos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gallery_photos (photo_id, uploader_id, url, caption, uploaded_at) FROM stdin;
cmp2f6vxx0004q96onza1arf7	cmp15xnse0000q901a4tp9tji	/uploads/gallery/cmp15xnse0000q901a4tp9tji/ba96536b-ee87-4ed0-af29-2a13646d53d0.jpg	TEK Club End of Semester Party	2025-11-26 12:00:00
cmp2f6vz50006q96ot981ahel	cmp15xnse0000q901a4tp9tji	/uploads/gallery/cmp15xnse0000q901a4tp9tji/47215e8f-480a-43a7-8690-7a23dfac5da5.jpg	TEK Club End of Semester Party	2025-11-26 12:00:00
cmp2f6vzy0008q96ox1nw8p5x	cmp15xnse0000q901a4tp9tji	/uploads/gallery/cmp15xnse0000q901a4tp9tji/f8b1d97b-5715-41a4-921b-5eebfa9ceeea.jpg	TEK Club End of Semester Party	2025-11-26 12:00:00
cmp2f6w1b000aq96ouf5vhy6g	cmp15xnse0000q901a4tp9tji	/uploads/gallery/cmp15xnse0000q901a4tp9tji/631dc901-f6c8-461d-bac5-2c68199dcfaf.jpg	TEK Club End of Semester Party	2025-11-26 12:00:00
cmp2f6w2b000cq96ovyfh28kh	cmp15xnse0000q901a4tp9tji	/uploads/gallery/cmp15xnse0000q901a4tp9tji/2ae24899-9755-42e6-87d0-7a63bfbad00f.jpg	TEK Club End of Semester Party	2025-11-26 12:00:00
cmprmgk630001q96lbeq8ld12	cmp15xnse0000q901a4tp9tji	/uploads/gallery/cmp15xnse0000q901a4tp9tji/54fe7586-938f-47f5-bc32-2cc7dc3db070.jpg	TEK CLUB Demo Day	2026-05-13 12:00:00
cmprmgk790003q96lmhimy9er	cmp15xnse0000q901a4tp9tji	/uploads/gallery/cmp15xnse0000q901a4tp9tji/7b6d2f46-a831-4247-bbc1-6eca838a4b17.jpg	TEK CLUB Demo Day	2026-05-13 12:00:00
cmprmgk820005q96l18dqnck7	cmp15xnse0000q901a4tp9tji	/uploads/gallery/cmp15xnse0000q901a4tp9tji/55af2b9f-ace5-4d6c-89a1-44aa8b7620a4.jpg	TEK CLUB Demo Day	2026-05-13 12:00:00
cmprmgk8w0007q96lbu8ersdn	cmp15xnse0000q901a4tp9tji	/uploads/gallery/cmp15xnse0000q901a4tp9tji/a93ed27a-e419-42c7-9242-d8b66cdb9c3f.jpg	TEK CLUB Demo Day	2026-05-13 12:00:00
cmprmgka00009q96l33gv2eyy	cmp15xnse0000q901a4tp9tji	/uploads/gallery/cmp15xnse0000q901a4tp9tji/17abef9e-1a80-4621-9147-c604cf86a9d4.jpg	TEK CLUB Demo Day	2026-05-13 12:00:00
cmprmgkcl000bq96l7vvqiysb	cmp15xnse0000q901a4tp9tji	/uploads/gallery/cmp15xnse0000q901a4tp9tji/d2d9cd85-2586-4a68-95b8-7e84170ff9fc.jpg	TEK CLUB Demo Day	2026-05-13 12:00:00
\.


--
-- Data for Name: lab_applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lab_applications (lab_app_id, member_id, lab_id, status, applied_at) FROM stdin;
\.


--
-- Data for Name: lab_leader_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lab_leader_assignments (lab_id, member_id) FROM stdin;
cmp2hlrk50002q9dyrrxtw8jp	cmp15xnse0000q901a4tp9tji
\.


--
-- Data for Name: lab_proposals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lab_proposals (proposal_id, proposed_by, reviewed_by, proposed_name, description, objective, status, proposed_at) FROM stdin;
cmp2hf2330001q9dy9cw4oq2w	cmp15xnse0000q901a4tp9tji	cmp15xnse0000q901a4tp9tji	Foreigner Assistance Service Development	I would like to create a web portal where I could collect foreigners difficulties and address them.	By the end of 2026, I would like to help out 10 foreigners (living in Korea) through this website.	APPROVED	2026-05-12 10:22:36.871
\.


--
-- Data for Name: leader_projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leader_projects (project_id, title, description, photo_url, updated_at, created_at, lab_id, website_url) FROM stdin;
cmp2imx6k0001q9jgrmf6s3mn	Livable - A Live Help Platform for Foreigner in Korea	A website of the Livable platform, where foreigners in Korea can submit a request about anything. Check it out!	/uploads/spotlight/cmp15xnse0000q901a4tp9tji/46b6c38f-4d84-4d0b-8c84-bd32d459e820.png	2026-05-12 12:47:51.712	2026-05-12 10:56:43.388	cmp2hlrk50002q9dyrrxtw8jp	https://livabletogether.vercel.app
\.


--
-- Data for Name: password_change_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_change_tickets (password_change_ticket_id, member_id, token, expires_at, used_at) FROM stdin;
\.


--
-- Data for Name: regular_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.regular_members (member_id, expected_graduation) FROM stdin;
\.


--
-- Data for Name: tutoring_videos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tutoring_videos (video_id, title, description, video_url, provider, uploader_id, created_at) FROM stdin;
\.


--
-- Data for Name: website_health_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.website_health_logs (log_id, recorded_by, metric_name, metric_value, recorded_at) FROM stdin;
\.


--
-- PostgreSQL database dump complete
--

\unrestrict ayU8A9Y7CVz4fJQ82xKDAJvf4KgwaLuPyInPBt7g5OVeLItEm895YRUWlxJIT7I

