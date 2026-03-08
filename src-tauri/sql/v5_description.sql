-- Ajout d'une description aux documents et feuilles de signature
ALTER TABLE documents ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE signature_sheets ADD COLUMN description TEXT NOT NULL DEFAULT '';
