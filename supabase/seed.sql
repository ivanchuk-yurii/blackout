select
  vault.create_secret (
    'http://supabase_kong_blackout:8000/functions/v1',
    'edge_functions_url'
  );

select
  vault.create_secret (
    'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz',
    'edge_functions_key'
  );

insert into
  auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    email_change_token_current,
    phone_change,
    phone_change_token,
    reauthentication_token
  )
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'johndoe@example.com',
    extensions.crypt ('123456', extensions.gen_salt ('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "John Doe", "compliance_accepted_at": "2026-01-01T00:00:00Z"}',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'janedoe@example.com',
    extensions.crypt ('123456', extensions.gen_salt ('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Jane Doe", "compliance_accepted_at": "2026-01-01T00:00:00Z"}',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'johndoe+1@example.com',
    extensions.crypt ('123456', extensions.gen_salt ('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "John Doe 1", "compliance_accepted_at": "2026-01-01T00:00:00Z"}',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated',
    'authenticated',
    'johndoe+2@example.com',
    extensions.crypt ('123456', extensions.gen_salt ('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "John Doe 2", "compliance_accepted_at": "2026-01-01T00:00:00Z"}',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  );

insert into
  auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    created_at,
    updated_at
  )
values
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'email',
    '{"sub": "11111111-1111-1111-1111-111111111111", "email": "johndoe@example.com", "email_verified": true, "phone_verified": false}',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'email',
    '{"sub": "22222222-2222-2222-2222-222222222222", "email": "janedoe@example.com", "email_verified": true, "phone_verified": false}',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'email',
    '{"sub": "33333333-3333-3333-3333-333333333333", "email": "johndoe+1@example.com", "email_verified": true, "phone_verified": false}',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '44444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'email',
    '{"sub": "44444444-4444-4444-4444-444444444444", "email": "johndoe+2@example.com", "email_verified": true, "phone_verified": false}',
    now(),
    now()
  );

insert into
  public.buddies (user_id, buddy_id)
values
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222'
  );

insert into
  public.buddy_requests (user_id, buddy_id)
values
  (
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111'
  );

insert into
  public.hangouts (id, name, creator_id, timezone)
values
  (
    '55555555-5555-5555-5555-555555555555',
    'Night drinks',
    '11111111-1111-1111-1111-111111111111',
    'Europe/London'
  );

insert into
  public.hangout_members (hangout_id, user_id)
values
  (
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222'
  );
