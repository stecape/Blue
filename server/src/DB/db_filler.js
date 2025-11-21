// Init DB with tables and triggers
export default function (client) {
  return new Promise((innerResolve, innerReject) => {
    var queryString=`
  
    -- In futuro si userà ENUM('google', 'apple', 'microsoft', 'local');

    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM('admin', 'user');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'identity_provider') THEN
        CREATE TYPE identity_provider AS ENUM('google');
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS public."User"
    (
      id SERIAL PRIMARY KEY,
      email text COLLATE pg_catalog."default" NOT NULL,
      name text COLLATE pg_catalog."default" NOT NULL,
      picture VARCHAR(512),
      role user_role NOT NULL DEFAULT 'user',
      UNIQUE(email)
    );


    CREATE TABLE IF NOT EXISTS public."User_Identities"
    (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      provider identity_provider NOT NULL,
      provider_user_id VARCHAR(255),
      password_hash VARCHAR(255)
    );


    CREATE TABLE IF NOT EXISTS public."Field"
    (
      id SERIAL PRIMARY KEY,
      name text COLLATE pg_catalog."default" NOT NULL,
      type integer NOT NULL,
      parent_type integer NOT NULL,
      fixed_id integer,
      um integer,
      logic_state integer,
      comment text COLLATE pg_catalog."default"
    );
    

    CREATE TABLE IF NOT EXISTS public."Tag"
    (
      id SERIAL PRIMARY KEY,
      name text COLLATE pg_catalog."default" NOT NULL,
      device integer NOT NULL,
      var integer NOT NULL,
      parent_tag integer,
      type_field integer,
      um integer,
      logic_state integer,
      comment text COLLATE pg_catalog."default",
      value json,
      fixed_id bigint
    );
    

    CREATE TABLE IF NOT EXISTS public."Type"
    (
      id SERIAL PRIMARY KEY,
      name text COLLATE pg_catalog."default" NOT NULL,
      base_type bool NOT NULL,
      locked bool NOT NULL
    );
      
    CREATE TABLE IF NOT EXISTS public."Device"
    (
      id SERIAL PRIMARY KEY,
      name text COLLATE pg_catalog."default" NOT NULL,
      template integer NOT NULL,
      status integer NOT NULL,
      utc_offset bigint NOT NULL DEFAULT 0,
      user_id integer
    );

    CREATE TABLE IF NOT EXISTS public."Var"
    (
      id SERIAL PRIMARY KEY,
      type integer NOT NULL,
      name text COLLATE pg_catalog."default" NOT NULL,
      template integer NOT NULL,
      fixed_id integer,
      um integer,
      logic_state integer,
      comment text COLLATE pg_catalog."default"
    );
    

    CREATE TABLE IF NOT EXISTS public."um"
    (
      id SERIAL PRIMARY KEY,
      name text COLLATE pg_catalog."default" NOT NULL,
      metric text COLLATE pg_catalog."default" NOT NULL,
      imperial text COLLATE pg_catalog."default" NOT NULL,
      gain real NOT NULL,
      "offset" real NOT NULL
    );
    

    CREATE TABLE IF NOT EXISTS public."LogicState"
    (
      id SERIAL PRIMARY KEY,
      name text COLLATE pg_catalog."default" NOT NULL,
      value text[] COLLATE pg_catalog."default" NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS public."Template"
    (
      id SERIAL PRIMARY KEY,
      name text COLLATE pg_catalog."default" NOT NULL
    );

    CREATE UNIQUE INDEX ui_field_name_and_parent_type 
      ON public."Field" (name, parent_type);

    CREATE UNIQUE INDEX ui_field_parent_type_and_fixed_id 
      ON public."Field" (parent_type, fixed_id);

    CREATE UNIQUE INDEX ui_var_template_and_fixed_id 
      ON public."Var" (template, fixed_id);

    ALTER TABLE IF EXISTS public."Field"
      DROP CONSTRAINT IF EXISTS field_type_id,
      ADD CONSTRAINT field_type_id FOREIGN KEY (type)
      REFERENCES public."Type" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE NO ACTION
      NOT VALID,
      DROP CONSTRAINT IF EXISTS parent_type_id,
      ADD CONSTRAINT parent_type_id FOREIGN KEY (parent_type)
      REFERENCES public."Type" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE NO ACTION
      NOT VALID,
      DROP CONSTRAINT IF EXISTS field_um_id,
      ADD CONSTRAINT field_um_id FOREIGN KEY (um)
      REFERENCES public."um" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE NO ACTION
      NOT VALID,
      DROP CONSTRAINT IF EXISTS field_logic_state_id,
      ADD CONSTRAINT field_logic_state_id FOREIGN KEY (logic_state)
      REFERENCES public."LogicState" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE NO ACTION
      NOT VALID,     
      DROP CONSTRAINT IF EXISTS unique_field_name_and_parent_type,
      ADD CONSTRAINT unique_field_name_and_parent_type UNIQUE USING INDEX ui_field_name_and_parent_type,
      DROP CONSTRAINT IF EXISTS unique_field_parent_type_and_fixed_id,
      ADD CONSTRAINT unique_field_parent_type_and_fixed_id UNIQUE USING INDEX ui_field_parent_type_and_fixed_id;


    CREATE UNIQUE INDEX ui_device_parent_tag_and_type_field 
      ON public."Tag" (device, parent_tag, type_field);
    
    ALTER TABLE IF EXISTS public."Tag"
      DROP CONSTRAINT IF EXISTS unique_device_and_tag_name,
      ADD CONSTRAINT unique_device_and_tag_name UNIQUE (device, name),
      DROP CONSTRAINT IF EXISTS tag_parent_tag_id,
      ADD CONSTRAINT tag_parent_tag_id FOREIGN KEY (parent_tag)
      REFERENCES public."Tag" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE NO ACTION
      NOT VALID,
      DROP CONSTRAINT IF EXISTS tag_device_id,
      ADD CONSTRAINT tag_device_id FOREIGN KEY (device)
      REFERENCES public."Device" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE CASCADE
      NOT VALID,
      DROP CONSTRAINT IF EXISTS tag_var_id,
      ADD CONSTRAINT tag_var_id FOREIGN KEY (var)
      REFERENCES public."Var" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE CASCADE
      NOT VALID,
      DROP CONSTRAINT IF EXISTS tag_type_field_id,
      ADD CONSTRAINT tag_type_field_id FOREIGN KEY (type_field)
      REFERENCES public."Field" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE NO ACTION
      NOT VALID,
      DROP CONSTRAINT IF EXISTS tag_um_id,
      ADD CONSTRAINT tag_um_id FOREIGN KEY (um)
      REFERENCES public."um" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE NO ACTION
      NOT VALID,
      DROP CONSTRAINT IF EXISTS tag_logic_state_id,
      ADD CONSTRAINT tag_logic_state_id FOREIGN KEY (logic_state)
      REFERENCES public."LogicState" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE NO ACTION
      NOT VALID,     
      DROP CONSTRAINT IF EXISTS unique_device_parent_tag_and_type_field,
      ADD CONSTRAINT unique_device_parent_tag_and_type_field UNIQUE USING INDEX ui_device_parent_tag_and_type_field;

    
    ALTER TABLE IF EXISTS public."Type"
      DROP CONSTRAINT IF EXISTS unique_type_name,
      ADD CONSTRAINT unique_type_name UNIQUE (name);

    
    ALTER TABLE IF EXISTS public."Var"
      DROP CONSTRAINT IF EXISTS unique_var_name,
      ADD CONSTRAINT unique_var_name UNIQUE (name),
      DROP CONSTRAINT IF EXISTS var_type_id,
      ADD CONSTRAINT var_type_id FOREIGN KEY (type)
      REFERENCES public."Type" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE NO ACTION
      NOT VALID,
      DROP CONSTRAINT IF EXISTS var_um_id,
      ADD CONSTRAINT var_um_id FOREIGN KEY (um)
      REFERENCES public."um" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE NO ACTION
      NOT VALID,
      DROP CONSTRAINT IF EXISTS var_template_id,
      ADD CONSTRAINT var_template_id FOREIGN KEY (template)
      REFERENCES public."Template" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE CASCADE,
      DROP CONSTRAINT IF EXISTS var_logic_state_id,
      ADD CONSTRAINT var_logic_state_id FOREIGN KEY (logic_state)
      REFERENCES public."LogicState" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE NO ACTION
      NOT VALID,
      DROP CONSTRAINT IF EXISTS unique_var_template_and_fixed_id,
      ADD CONSTRAINT unique_var_template_and_fixed_id UNIQUE USING INDEX ui_var_template_and_fixed_id;


    ALTER TABLE IF EXISTS public."um"
      DROP CONSTRAINT IF EXISTS unique_um_name,
      ADD CONSTRAINT unique_um_name UNIQUE (name);


    ALTER TABLE IF EXISTS public."LogicState"
      DROP CONSTRAINT IF EXISTS unique_LogicState_name,
      ADD CONSTRAINT unique_LogicState_name UNIQUE (name);


    ALTER TABLE IF EXISTS public."Device"
      DROP CONSTRAINT IF EXISTS unique_device_name,
      ADD CONSTRAINT unique_device_name UNIQUE (name),
      DROP CONSTRAINT IF EXISTS device_user_id,
      ADD CONSTRAINT device_user_id FOREIGN KEY (user_id)
      REFERENCES public."User" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE SET NULL
      NOT VALID,
      DROP CONSTRAINT IF EXISTS device_template_id,
      ADD CONSTRAINT device_template_id FOREIGN KEY (template)
      REFERENCES public."Template" (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION
      NOT VALID;


    CREATE UNIQUE INDEX ui_provider_and_provider_user_id 
      ON public."User_Identities" (provider, provider_user_id);

    ALTER TABLE IF EXISTS public."User_Identities"
      DROP CONSTRAINT IF EXISTS identities_user_id,
      ADD CONSTRAINT identities_user_id FOREIGN KEY (user_id)
      REFERENCES public."User" (id) MATCH SIMPLE
      ON UPDATE CASCADE
      ON DELETE SET NULL
      NOT VALID,
      DROP CONSTRAINT IF EXISTS unique_provider_and_provider_user_id,
      ADD CONSTRAINT unique_provider_and_provider_user_id UNIQUE USING INDEX ui_provider_and_provider_user_id;


    ALTER TABLE IF EXISTS public."Template"
      DROP CONSTRAINT IF EXISTS unique_template_name,
      ADD CONSTRAINT unique_template_name UNIQUE (name);


    -- Aggiorna la sequenza solo se l'id massimo è inferiore a 99
    DO $$
    BEGIN
      IF (SELECT COALESCE(MAX(id), 0) FROM public."Type") < 99 THEN
      PERFORM setval('public."Type_id_seq"', 100);
      END IF;

      IF (SELECT COALESCE(MAX(id), 0) FROM public."Field") < 99 THEN
      PERFORM setval('public."Field_id_seq"', 100);
      END IF;

      IF (SELECT COALESCE(MAX(id), 0) FROM public."um") < 99 THEN
      PERFORM setval('public."um_id_seq"', 100);
      END IF;

      IF (SELECT COALESCE(MAX(id), 0) FROM public."LogicState") < 99 THEN
      PERFORM setval('public."LogicState_id_seq"', 100);
      END IF;

      IF (SELECT COALESCE(MAX(id), 0) FROM public."Device") < 99 THEN
      PERFORM setval('public."Device_id_seq"', 100);
      END IF;

      IF (SELECT COALESCE(MAX(id), 0) FROM public."Tag") < 99 THEN
      PERFORM setval('public."Tag_id_seq"', 100);
      END IF;
    END $$;


    INSERT INTO "Type"(id,name,base_type, locked) VALUES (1, 'Real', true, true) ON CONFLICT (name) DO NOTHING;
    --INSERT INTO "Type"(id,name,base_type, locked) VALUES (2, 'Text', true, true) ON CONFLICT (name) DO NOTHING; !!!!!!SPARE!!!!!!
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (3, 'Int', true, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (4, 'Bool', true, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (5, 'String', true, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (6, 'TimeStamp', true, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (7, '_Set', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (8, '_Act', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (9, '_Limit', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (10, 'Set', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (11, 'Act', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (12, 'SetAct', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (13, 'LogicSelection', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (14, 'LogicStatus', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (15, 'Alarm', false, true) ON CONFLICT (name) DO NOTHING;

    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (1, 'InputValue', 1, 7, 1, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (2, 'Value', 1, 7, 2, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (3, 'HMIValue', 1, 8, 1, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (4, 'Value', 1, 8, 2, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (5, 'Min', 1, 9, 1, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (6, 'Max', 1, 9, 2, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (7, 'Set', 7, 10, 1, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (8, 'Limit', 9, 10, 2, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (9, 'Decimals', 3, 10, 3, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (10, 'Init', 4, 10, 4, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (11, 'Act', 8, 11, 1, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (12, 'Limit', 9, 11, 2, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (13, 'Decimals', 3, 11, 3, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (14, 'Set', 7, 12, 1, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (15, 'Act', 8, 12, 2, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (16, 'Limit', 9, 12, 3, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (17, 'Decimals', 3, 12, 4, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (18, 'Init', 4, 12, 5, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (19, 'Command', 3, 13, 1, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (20, 'Status', 3, 13, 2, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (21, 'Status', 3, 14, 1, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (22, 'Status', 3, 15, 1, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (23, 'Reaction', 3, 15, 2, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (24, 'Ts', 6, 15, 3, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, fixed_id, comment) VALUES (25, 'Q', 4, 15, 4, '') ON CONFLICT (name, parent_type) DO NOTHING;
    
    INSERT INTO "um"(id, name, metric, imperial, gain, "offset") VALUES (1, 'm_ft', 'm', 'ft', 3.28084, 0) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "um"(id, name, metric, imperial, gain, "offset") VALUES (2, '°C_°F', '°C', '°F', 1.8, 32) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "um"(id, name, metric, imperial, gain, "offset") VALUES (3, 'Bar_psi', 'Bar', 'psi', 14.5038, 0) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "um"(id, name, metric, imperial, gain, "offset") VALUES (4, 'W', 'W', 'W', 1.0, 0) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "um"(id, name, metric, imperial, gain, "offset") VALUES (5, '%', '%', '%', 1.0, 0) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "LogicState"(id, name, value) VALUES (1, 'OFF_ON', '{OFF,ON,"","","","","",""}') ON CONFLICT (name) DO NOTHING;


    -- triggers function
    -- FUNCTION: public.return_data()
    CREATE OR REPLACE FUNCTION public.return_data()
      RETURNS trigger
      LANGUAGE 'plpgsql'
      COST 100
      VOLATILE
    AS $BODY$
    DECLARE
      obj text := '';
    BEGIN 
    RAISE NOTICE 'obj: %', OLD::text;
      IF (TG_OP = 'UPDATE') THEN
      obj = '{"operation":' || to_json(TG_OP)::text || ',"table":' || to_json(TG_TABLE_NAME)::text || ',"data":' || row_to_json(NEW)::text || '}';
      PERFORM pg_notify('changes', obj);
      ELSIF (TG_OP = 'INSERT') THEN
      obj = '{"operation":' || to_json(TG_OP)::text || ',"table":' || to_json(TG_TABLE_NAME)::text || ',"data":' || row_to_json(NEW)::text || '}';
      PERFORM pg_notify('changes', obj);
      ELSIF (TG_OP = 'DELETE') THEN 
      obj = '{"operation":' || to_json(TG_OP)::text || ',"table":' || to_json(TG_TABLE_NAME)::text || ',"data":' || row_to_json(OLD)::text || '}';
      PERFORM pg_notify('changes', obj);
      ELSIF (TG_OP = 'TRUNCATE') THEN 
      obj = '{"operation":' || to_json(TG_OP)::text || ',"table":' || to_json(TG_TABLE_NAME)::text || '}';
      PERFORM pg_notify('changes', obj);
      END IF;
      RETURN NULL;
    END;
    $BODY$;

    -- triggers on Tag
    CREATE OR REPLACE TRIGGER TagInsertionTrigger AFTER INSERT ON "Tag" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER TagUpdatingTrigger AFTER UPDATE ON "Tag" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER TagDeletingTrigger AFTER DELETE ON "Tag" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER TagTruncatingTrigger AFTER TRUNCATE ON "Tag" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on Template
    CREATE OR REPLACE TRIGGER TemplateInsertionTrigger AFTER INSERT ON "Template" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER TemplateUpdatingTrigger AFTER UPDATE ON "Template" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER TemplateDeletingTrigger AFTER DELETE ON "Template" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER TemplateTruncatingTrigger AFTER TRUNCATE ON "Template" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on Device
    CREATE OR REPLACE TRIGGER DeviceInsertionTrigger AFTER INSERT ON "Device" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER DeviceUpdatingTrigger AFTER UPDATE ON "Device" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER DeviceDeletingTrigger AFTER DELETE ON "Device" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER DeviceTruncatingTrigger AFTER TRUNCATE ON "Device" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on Var
    CREATE OR REPLACE TRIGGER VarInsertionTrigger AFTER INSERT ON "Var" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER VarUpdatingTrigger AFTER UPDATE ON "Var" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER VarDeletingTrigger AFTER DELETE ON "Var" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER VarTruncatingTrigger AFTER TRUNCATE ON "Var" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on Type
    CREATE OR REPLACE TRIGGER TypeInsertionTrigger AFTER INSERT ON "Type" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER TypeUpdatingTrigger AFTER UPDATE ON "Type" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER TypeDeletingTrigger AFTER DELETE ON "Type" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER TypeTruncatingTrigger AFTER TRUNCATE ON "Type" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on Field
    CREATE OR REPLACE TRIGGER FieldInsertionTrigger AFTER INSERT ON "Field" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER FieldUpdatingTrigger AFTER UPDATE ON "Field" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER FieldDeletingTrigger AFTER DELETE ON "Field" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER FieldTruncatingTrigger AFTER TRUNCATE ON "Field" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on Um
    CREATE OR REPLACE TRIGGER UmInsertionTrigger AFTER INSERT ON "um" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER UmUpdatingTrigger AFTER UPDATE ON "um" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER UmDeletingTrigger AFTER DELETE ON "um" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER UmTruncatingTrigger AFTER TRUNCATE ON "um" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on LogicState
    CREATE OR REPLACE TRIGGER LogicStateInsertionTrigger AFTER INSERT ON "LogicState" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER LogicStateUpdatingTrigger AFTER UPDATE ON "LogicState" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER LogicStateDeletingTrigger AFTER DELETE ON "LogicState" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER LogicStateTruncatingTrigger AFTER TRUNCATE ON "LogicState" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on User
    CREATE OR REPLACE TRIGGER UserInsertionTrigger AFTER INSERT ON "User" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER UserUpdatingTrigger AFTER UPDATE ON "User" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER UserDeletingTrigger AFTER DELETE ON "User" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER UserTruncatingTrigger AFTER TRUNCATE ON "User" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on User_Identities
    CREATE OR REPLACE TRIGGER UserIdentitiesInsertionTrigger AFTER INSERT ON "User_Identities" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER UserIdentitiesUpdatingTrigger AFTER UPDATE ON "User_Identities" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER UserIdentitiesDeletingTrigger AFTER DELETE ON "User_Identities" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER UserIdentitiesTruncatingTrigger AFTER TRUNCATE ON "User_Identities" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    `

  client.query({
      text: queryString
    })
    .then(() => {innerResolve()})
    .catch(err => {
      console.log("Error during DB initialization")
      innerReject(err)
    })
    
  })
}