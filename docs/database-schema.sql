-- UstaGo Database Schema
-- PostgreSQL 16 with PostGIS

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- ============================================
-- USERS MODULE
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    username VARCHAR(150) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    avatar VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'master', 'company', 'admin', 'super_admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned', 'deleted')),
    full_name VARCHAR(255) NOT NULL,
    bio TEXT DEFAULT '',
    lang VARCHAR(10) DEFAULT 'uz' CHECK (lang IN ('uz', 'ru', 'en')),
    device_id VARCHAR(255) DEFAULT '',
    device_type VARCHAR(50) DEFAULT '',
    fcm_token TEXT DEFAULT '',
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_identity_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32) DEFAULT '',
    email VARCHAR(254),
    otp_secret VARCHAR(32) DEFAULT '',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_full_name_trgm ON users USING GIN (full_name gin_trgm_ops);

-- ============================================
-- USER ADDRESSES
-- ============================================

CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    apartment VARCHAR(100) DEFAULT '',
    entrance VARCHAR(50) DEFAULT '',
    floor VARCHAR(50) DEFAULT '',
    door_code VARCHAR(50) DEFAULT '',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography) STORED
);

CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_location ON user_addresses USING GIST (location);

-- ============================================
-- MASTER PROFILES
-- ============================================

CREATE TABLE master_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    experience INTEGER DEFAULT 0,
    description TEXT DEFAULT '',
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    rating_count INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    cancelled_jobs INTEGER DEFAULT 0,
    response_time INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 100.0,
    is_online BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_face_verified BOOLEAN DEFAULT FALSE,
    price_per_hour DECIMAL(12,2) DEFAULT 0,
    min_order_price DECIMAL(12,2) DEFAULT 50000,
    max_distance INTEGER DEFAULT 50,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    location_updated_at TIMESTAMP WITH TIME ZONE,
    working_from TIME DEFAULT '08:00',
    working_to TIME DEFAULT '20:00',
    working_days VARCHAR(50) DEFAULT '1,2,3,4,5,6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
        CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL
        THEN ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
        ELSE NULL END
    ) STORED
);

CREATE INDEX idx_master_profiles_user ON master_profiles(user_id);
CREATE INDEX idx_master_profiles_rating ON master_profiles(rating DESC);
CREATE INDEX idx_master_profiles_available ON master_profiles(is_available, is_online);
CREATE INDEX idx_master_profiles_location ON master_profiles USING GIST (location) WHERE location IS NOT NULL;
CREATE INDEX idx_master_profiles_completed_jobs ON master_profiles(completed_jobs DESC);

-- ============================================
-- MASTER DOCUMENTS
-- ============================================

CREATE TABLE master_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_id UUID NOT NULL REFERENCES master_profiles(id) ON DELETE CASCADE,
    doc_type VARCHAR(20) NOT NULL CHECK (doc_type IN ('passport', 'id_card', 'certificate', 'license', 'diploma', 'other')),
    file VARCHAR(500) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by_id UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_master_documents_master ON master_documents(master_id);

-- ============================================
-- MASTER PORTFOLIO
-- ============================================

CREATE TABLE master_portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_id UUID NOT NULL REFERENCES master_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    image VARCHAR(500) NOT NULL,
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_master_portfolio_master ON master_portfolio(master_id);

-- ============================================
-- MASTER SCHEDULES
-- ============================================

CREATE TABLE master_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_id UUID NOT NULL REFERENCES master_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    start_time TIME,
    end_time TIME,
    UNIQUE(master_id, date)
);

-- ============================================
-- CATEGORIES (MPTT)
-- ============================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_uz VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255) DEFAULT '',
    title_en VARCHAR(255) DEFAULT '',
    description TEXT DEFAULT '',
    icon VARCHAR(500),
    image VARCHAR(500),
    parent_id UUID REFERENCES categories(id),
    lft INTEGER NOT NULL DEFAULT 0,
    rght INTEGER NOT NULL DEFAULT 0,
    tree_id INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    commission_percent DECIMAL(5,2) DEFAULT 10.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_featured ON categories(is_featured) WHERE is_featured = TRUE;

-- ============================================
-- SERVICES
-- ============================================

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    title_uz VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255) DEFAULT '',
    title_en VARCHAR(255) DEFAULT '',
    description TEXT DEFAULT '',
    price_from DECIMAL(12,2) DEFAULT 0,
    price_to DECIMAL(12,2) DEFAULT 0,
    duration_minutes INTEGER DEFAULT 60,
    icon VARCHAR(50) DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_active ON services(is_active, category_id);

-- M2M: master_profiles <-> categories
CREATE TABLE master_profiles_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    masterprofile_id UUID NOT NULL REFERENCES master_profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(masterprofile_id, category_id)
);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id),
    master_id UUID REFERENCES master_profiles(id),
    category_id UUID REFERENCES categories(id),
    service_id UUID REFERENCES services(id),
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'looking_master', 'offered', 'accepted',
        'in_progress', 'completed', 'cancelled', 'disputed'
    )),
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
    budget DECIMAL(12,2),
    final_price DECIMAL(12,2),
    commission DECIMAL(12,2) DEFAULT 0,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    address TEXT NOT NULL,
    apartment VARCHAR(100) DEFAULT '',
    preferred_date DATE,
    preferred_time TIME,
    ai_category VARCHAR(255) DEFAULT '',
    ai_price_estimate_min DECIMAL(12,2),
    ai_price_estimate_max DECIMAL(12,2),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT DEFAULT '',
    is_paid BOOLEAN DEFAULT FALSE,
    is_rated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography) STORED
);

CREATE INDEX idx_orders_customer ON orders(customer_id, status);
CREATE INDEX idx_orders_master ON orders(master_id, status);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_category ON orders(category_id);
CREATE INDEX idx_orders_location ON orders USING GIST (location);

-- ============================================
-- ORDER IMAGES / VIDEOS / VOICES
-- ============================================

CREATE TABLE order_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    image VARCHAR(500) NOT NULL,
    is_before BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_images_order ON order_images(order_id);

CREATE TABLE order_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    video VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_voices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    audio VARCHAR(500) NOT NULL,
    duration INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDER OFFERS
-- ============================================

CREATE TABLE order_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    master_id UUID NOT NULL REFERENCES master_profiles(id),
    price DECIMAL(12,2) NOT NULL,
    description TEXT DEFAULT '',
    estimated_duration INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_id, master_id)
);

CREATE INDEX idx_order_offers_order ON order_offers(order_id);

-- ============================================
-- ORDER STATUS LOGS (Audit Trail)
-- ============================================

CREATE TABLE order_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(20) NOT NULL,
    to_status VARCHAR(20) NOT NULL,
    changed_by_id UUID REFERENCES users(id),
    note TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_status_logs_order ON order_status_logs(order_id, created_at);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    master_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    commission_percent DECIMAL(5,2) DEFAULT 10,
    commission_amount DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'held', 'completed', 'refunded', 'failed', 'cancelled')),
    method VARCHAR(20) DEFAULT 'wallet' CHECK (method IN ('payme', 'click', 'uzum', 'visa', 'mastercard', 'cash', 'wallet')),
    transaction_id VARCHAR(255) DEFAULT '',
    payment_url VARCHAR(500) DEFAULT '',
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_master ON payments(master_id);
CREATE INDEX idx_payments_created ON payments(created_at DESC);

-- ============================================
-- PAYOUTS
-- ============================================

CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    commission DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    bank_account VARCHAR(255) DEFAULT '',
    card_number VARCHAR(50) DEFAULT '',
    phone VARCHAR(20) DEFAULT '',
    method VARCHAR(50) DEFAULT 'bank',
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payouts_user ON payouts(user_id);

-- ============================================
-- WALLETS
-- ============================================

CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    balance DECIMAL(15,2) DEFAULT 0 CHECK (balance >= 0),
    hold_balance DECIMAL(15,2) DEFAULT 0 CHECK (hold_balance >= 0),
    total_earned DECIMAL(15,2) DEFAULT 0,
    total_withdrawn DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRANSACTIONS
-- ============================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES user_wallets(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'commission', 'bonus')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    amount DECIMAL(15,2) NOT NULL,
    commission DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    description TEXT DEFAULT '',
    reference_id VARCHAR(255) DEFAULT '',
    payment_method VARCHAR(50) DEFAULT '',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_wallet ON transactions(wallet_id, created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ============================================
-- REVIEWS
-- ============================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    target_user_id UUID NOT NULL REFERENCES users(id),
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    quality SMALLINT DEFAULT 5 CHECK (quality >= 1 AND quality <= 5),
    speed SMALLINT DEFAULT 5 CHECK (speed >= 1 AND speed <= 5),
    communication SMALLINT DEFAULT 5 CHECK (communication >= 1 AND communication <= 5),
    professionalism SMALLINT DEFAULT 5 CHECK (professionalism >= 1 AND professionalism <= 5),
    comment TEXT DEFAULT '',
    is_reported BOOLEAN DEFAULT FALSE,
    report_reason TEXT DEFAULT '',
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_target ON reviews(target_user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

CREATE TABLE review_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    image VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CHAT
-- ============================================

CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_rooms_updated ON chat_rooms(updated_at DESC);

CREATE TABLE chat_room_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatroom_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(chatroom_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file', 'voice', 'location', 'system')),
    content TEXT DEFAULT '',
    file VARCHAR(500),
    image VARCHAR(500),
    voice VARCHAR(500),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    is_read BOOLEAN DEFAULT FALSE,
    is_delivered BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    reply_to_id UUID REFERENCES messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_room ON messages(room_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(room_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'system' CHECK (type IN ('order', 'payment', 'chat', 'promo', 'system', 'review')),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    image VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    title_uz VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255) DEFAULT '',
    title_en VARCHAR(255) DEFAULT '',
    body_uz TEXT NOT NULL,
    body_ru TEXT DEFAULT '',
    body_en TEXT DEFAULT '',
    type VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- FAVORITES
-- ============================================

CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    master_id UUID NOT NULL REFERENCES master_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, master_id)
);

-- ============================================
-- ANALYTICS
-- ============================================

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255) DEFAULT '',
    ip_address INET,
    user_agent TEXT DEFAULT '',
    path VARCHAR(500) DEFAULT '',
    method VARCHAR(10) DEFAULT '',
    data JSONB DEFAULT '{}',
    duration_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type, created_at);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);

CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE UNIQUE NOT NULL,
    new_users INTEGER DEFAULT 0,
    new_masters INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    platform_commission DECIMAL(15,2) DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    active_masters INTEGER DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_daily_metrics_date ON daily_metrics(date DESC);

CREATE TABLE revenue_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    gross_revenue DECIMAL(15,2) DEFAULT 0,
    net_revenue DECIMAL(15,2) DEFAULT 0,
    commission_earned DECIMAL(15,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    total_masters INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AI MODULE
-- ============================================

CREATE TABLE ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    input_text TEXT NOT NULL,
    detected_category VARCHAR(255) DEFAULT '',
    detected_subcategory VARCHAR(255) DEFAULT '',
    price_estimate_min DECIMAL(12,2),
    price_estimate_max DECIMAL(12,2),
    estimated_duration VARCHAR(100) DEFAULT '',
    confidence_score DECIMAL(5,2) DEFAULT 0,
    suggested_masters_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_analyses_created ON ai_analyses(created_at DESC);

CREATE TABLE fraud_detection_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('user', 'order', 'review', 'payment')),
    target_id VARCHAR(255) NOT NULL,
    score DECIMAL(5,2) DEFAULT 0,
    is_fraudulent BOOLEAN DEFAULT FALSE,
    reasons JSONB DEFAULT '[]',
    details JSONB DEFAULT '{}',
    reviewed_by_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fraud_detection_type ON fraud_detection_results(target_type, created_at);

CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    recommended_master_id UUID NOT NULL REFERENCES master_profiles(id),
    score DECIMAL(5,2) NOT NULL,
    reason TEXT DEFAULT '',
    is_clicked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ai_chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    intent VARCHAR(255) DEFAULT '',
    confidence DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DJANGO SYSTEM TABLES
-- ============================================

-- Constance config
CREATE TABLE constance_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL
);

-- Django Celery Beat
CREATE TABLE django_celery_beat_periodictask (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    task VARCHAR(200) NOT NULL,
    args TEXT DEFAULT '[]',
    kwargs TEXT DEFAULT '{}',
    queue VARCHAR(200),
    exchange VARCHAR(200),
    routing_key VARCHAR(200),
    expires TIMESTAMP WITH TIME ZONE,
    enabled BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    total_run_count INTEGER DEFAULT 0,
    date_changed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT DEFAULT ''
);

-- ============================================
-- AUDIT LOGS (for sensitive operations)
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- TRIGGERS: updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_profiles_updated_at BEFORE UPDATE ON master_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON user_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS: Nearby Masters Search
-- ============================================

CREATE OR REPLACE FUNCTION find_nearby_masters(
    p_lat DECIMAL,
    p_lng DECIMAL,
    p_radius_km INTEGER DEFAULT 50,
    p_category_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
    master_id UUID,
    user_id UUID,
    full_name VARCHAR,
    rating DECIMAL,
    completed_jobs INTEGER,
    distance_km DECIMAL,
    price_per_hour DECIMAL,
    is_online BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        mp.id,
        u.id,
        u.full_name,
        mp.rating,
        mp.completed_jobs,
        ROUND(
            ST_Distance(
                mp.location,
                ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
            ) / 1000.0, 2
        ) AS distance_km,
        mp.price_per_hour,
        mp.is_online
    FROM master_profiles mp
    JOIN users u ON u.id = mp.user_id
    WHERE mp.is_available = TRUE
        AND u.status = 'active'
        AND mp.location IS NOT NULL
        AND ST_DWithin(
            mp.location,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
            p_radius_km * 1000
        )
        AND (p_category_id IS NULL OR mp.id IN (
            SELECT mpc.masterprofile_id FROM master_profiles_categories mpc WHERE mpc.category_id = p_category_id
        ))
    ORDER BY
        mp.is_online DESC,
        mp.rating DESC,
        distance_km ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA: Initial Categories
-- ============================================

INSERT INTO categories (id, title_uz, title_ru, title_en, sort_order, is_active, is_featured, lft, rght, tree_id, level)
VALUES
    (uuid_generate_v4(), 'Santexnik', 'Сантехник', 'Plumber', 1, TRUE, TRUE, 1, 2, 1, 0),
    (uuid_generate_v4(), 'Elektrik', 'Электрик', 'Electrician', 2, TRUE, TRUE, 3, 4, 1, 0),
    (uuid_generate_v4(), 'Svarchik', 'Сварщик', 'Welder', 3, TRUE, TRUE, 5, 6, 1, 0),
    (uuid_generate_v4(), 'Quruvchi', 'Строитель', 'Builder', 4, TRUE, TRUE, 7, 8, 1, 0),
    (uuid_generate_v4(), 'Konditsioner', 'Кондиционер', 'AC Technician', 5, TRUE, TRUE, 9, 10, 1, 0),
    (uuid_generate_v4(), 'Maishiy texnika', 'Бытовая техника', 'Appliance Repair', 6, TRUE, TRUE, 11, 12, 1, 0),
    (uuid_generate_v4(), 'Tozalash', 'Уборка', 'Cleaning', 7, TRUE, TRUE, 13, 14, 1, 0),
    (uuid_generate_v4(), 'Bog\'bon', 'Садовник', 'Gardener', 8, TRUE, TRUE, 15, 16, 1, 0),
    (uuid_generate_v4(), 'Mebel ustasi', 'Мебельщик', 'Furniture Master', 9, TRUE, TRUE, 17, 18, 1, 0),
    (uuid_generate_v4(), 'Kompyuter ta\'mirlash', 'Ремонт компьютеров', 'Computer Repair', 10, TRUE, TRUE, 19, 20, 1, 0),
    (uuid_generate_v4(), 'Internet', 'Интернет', 'Internet Technician', 11, TRUE, FALSE, 21, 22, 1, 0),
    (uuid_generate_v4(), 'TV ta\'mirlash', 'Ремонт телевизоров', 'TV Repair', 12, TRUE, FALSE, 23, 24, 1, 0);
