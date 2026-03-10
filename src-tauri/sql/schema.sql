-- Registre de securite — Schema complet (v1)

-- Preferences utilisateur (theme, etc.)
CREATE TABLE IF NOT EXISTS preferences (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Classeurs (conteneurs principaux)
CREATE TABLE IF NOT EXISTS classeurs (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    name                     TEXT    NOT NULL DEFAULT 'Mon classeur',
    icon                     TEXT    NOT NULL DEFAULT 'BookOpen',
    etablissement            TEXT    NOT NULL DEFAULT '',
    etablissement_complement TEXT    NOT NULL DEFAULT '',
    sort_order               INTEGER NOT NULL DEFAULT 0,
    created_at               TEXT    DEFAULT CURRENT_TIMESTAMP
);

-- Chapitres rattaches a un classeur
CREATE TABLE IF NOT EXISTS chapters (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    label       TEXT    NOT NULL,
    icon        TEXT    NOT NULL DEFAULT 'FileText',
    description TEXT    NOT NULL DEFAULT '',
    classeur_id INTEGER NOT NULL DEFAULT 1,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chapters_classeur ON chapters(classeur_id);

-- Documents Markdown rattaches a un chapitre
CREATE TABLE IF NOT EXISTS documents (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    content     TEXT    NOT NULL DEFAULT '',
    chapter_id  TEXT    NOT NULL DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT    DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_documents_chapter ON documents(chapter_id);

-- Referentiel des periodicites de suivi
CREATE TABLE IF NOT EXISTS periodicites (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    label      TEXT    NOT NULL,
    nombre     INTEGER NOT NULL DEFAULT 8,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- Feuilles de suivi periodique
CREATE TABLE IF NOT EXISTS tracking_sheets (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    title          TEXT    NOT NULL,
    chapter_id     TEXT    NOT NULL DEFAULT '',
    periodicite_id INTEGER NOT NULL,
    sort_order     INTEGER NOT NULL DEFAULT 0,
    created_at     TEXT    DEFAULT CURRENT_TIMESTAMP,
    updated_at     TEXT    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (periodicite_id) REFERENCES periodicites(id)
);
CREATE INDEX IF NOT EXISTS idx_tracking_sheets_chapter ON tracking_sheets(chapter_id);

-- Feuilles de signature
CREATE TABLE IF NOT EXISTS signature_sheets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    chapter_id  TEXT    NOT NULL DEFAULT '',
    nombre      INTEGER NOT NULL DEFAULT 14,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT    DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_signature_sheets_chapter ON signature_sheets(chapter_id);

-- Intercalaires (pages de separation entre sections)
CREATE TABLE IF NOT EXISTS intercalaires (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    chapter_id  TEXT    NOT NULL DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT    DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_intercalaires_chapter ON intercalaires(chapter_id);

-- Donnees par defaut

-- Classeur par defaut
INSERT INTO classeurs (id, name, sort_order) VALUES (1, 'Mon classeur', 1);

-- Periodicites de suivi
INSERT INTO periodicites (label, nombre, sort_order) VALUES
    ('Mensuel',        8, 1),
    ('Sesquimestriel', 8, 2),
    ('Semestriel',     8, 3),
    ('Annuel',         8, 4),
    ('Biennale',       8, 5),
    ('Triennal',       4, 6),
    ('Quadriennal',    4, 7),
    ('Quinquennal',    4, 8),
    ('Non defini',     8, 9);

-- Chapitres par defaut du registre ERP
INSERT INTO chapters (label, icon, description, sort_order, classeur_id) VALUES
    ('Informations generales',    'Building2',      'Identite de l''etablissement, classement ERP, coordonnees et informations administratives.', 1, 1),
    ('Verifications periodiques', 'ClipboardCheck', 'Rapports de verifications techniques reglementaires (electricite, gaz, ascenseurs, etc.).', 2, 1),
    ('Moyens de secours',         'ShieldAlert',    'Inventaire et maintenance des equipements de securite (extincteurs, alarmes, desenfumage, etc.).', 3, 1),
    ('Formation du personnel',    'GraduationCap',  'Attestations de formation securite incendie, exercices d''evacuation et habilitations.', 4, 1),
    ('Travaux',                   'Wrench',         'Suivi des travaux realises ou en cours impactant la securite de l''etablissement.', 5, 1),
    ('Observations',              'Eye',            'Remarques, anomalies constatees et actions correctives a mener.', 6, 1),
    ('Consignes de securite',     'ScrollText',     'Consignes generales et particulieres de securite, plans d''evacuation et procedures.', 7, 1),
    ('Commissions de securite',   'Users',          'Proces-verbaux des commissions de securite et suivi des prescriptions.', 8, 1);
