// Skills taxonomy: maps known technical skills to canonical categories.
// Lookup is case-insensitive on the lowercased skill string. Skills not in
// the exact-match table fall through to keyword-rule heuristics; anything
// still uncategorized lands in an "Other" bucket where the user can
// manually re-home them.
//
// Adding a new skill: drop the exact name into the matching list below. The
// flat lookup map (SKILL_TO_CATEGORY) is rebuilt automatically.

const TAXONOMY = {
    'Languages': [
        'Java', 'Python', 'JavaScript', 'TypeScript', 'SQL', 'PL/SQL',
        'C', 'C++', 'C#', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP',
        'Swift', 'Kotlin', 'Scala', 'R', 'Bash', 'Shell', 'Perl', 'Lua',
        'Dart', 'Objective-C', 'Elixir', 'Haskell', 'Clojure',
    ],
    'Frameworks': [
        'Spring', 'Spring Boot', 'Spring Security', 'Spring MVC',
        'Spring Data', 'Spring Cloud', 'Spring WebFlux',
        'Hibernate', 'Hibernate ORM', 'JPA', 'MyBatis',
        'React', 'React Native', 'Angular', 'Vue', 'Vue.js', 'Svelte',
        'Next.js', 'Nuxt', 'Remix', 'Gatsby',
        'Django', 'Flask', 'FastAPI', 'Tornado',
        'Express', 'Express.js', 'Node.js', 'NestJS',
        'Ruby on Rails', 'Rails', 'Laravel', 'Symfony',
        '.NET', '.NET Core', 'ASP.NET', 'Blazor',
        'jQuery', 'Bootstrap', 'Tailwind CSS',
    ],
    'Databases': [
        'MySQL', 'PostgreSQL', 'Postgres', 'MongoDB', 'Redis', 'Cassandra',
        'DynamoDB', 'Elasticsearch', 'SQLite', 'Oracle', 'Oracle DB',
        'MariaDB', 'SQL Server', 'MSSQL', 'Neo4j', 'InfluxDB', 'CouchDB',
        'Firestore', 'Realm',
    ],
    'Cloud & Big Data': [
        'AWS', 'Amazon Web Services', 'Azure', 'Microsoft Azure', 'GCP',
        'Google Cloud', 'Google Cloud Platform', 'Heroku', 'Vercel',
        'Netlify', 'DigitalOcean', 'Cloudflare',
        'Spark', 'Apache Spark', 'Kafka', 'Apache Kafka', 'Hadoop',
        'Snowflake', 'Databricks', 'BigQuery', 'Redshift', 'Airflow',
        'Pinot', 'Flink', 'Beam', 'Dataflow', 'EMR', 'Glue',
    ],
    'DevOps & Tools': [
        'Docker', 'Kubernetes', 'K8s', 'Terraform', 'Ansible', 'Pulumi',
        'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI', 'Travis CI',
        'ArgoCD', 'Helm', 'Istio',
        'Prometheus', 'Grafana', 'Datadog', 'New Relic', 'Splunk', 'ELK',
        'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Mercurial',
        'Maven', 'Gradle', 'NPM', 'Yarn', 'pnpm', 'Pip', 'Poetry', 'Cargo',
        'Postman', 'Insomnia', 'Swagger', 'OpenAPI', 'Swagger / OpenAPI',
        'Jira', 'Confluence', 'Linear', 'Notion', 'Slack',
        'Vim', 'VS Code', 'IntelliJ IDEA', 'Eclipse',
    ],
    'Visualization & BI': [
        'Tableau', 'Power BI', 'Looker', 'Streamlit', 'Excel',
        'Google Sheets', 'Matplotlib', 'Seaborn', 'Plotly', 'D3.js',
        'Recharts', 'Chart.js', 'Metabase', 'Mode', 'Periscope',
    ],
    'Machine Learning': [
        'Pandas', 'NumPy', 'Scikit-learn', 'PyTorch', 'TensorFlow',
        'Keras', 'XGBoost', 'LightGBM', 'CatBoost', 'Hugging Face',
        'Transformers', 'LangChain', 'LlamaIndex', 'OpenAI', 'Anthropic',
        'PySpark', 'MLflow', 'Weights & Biases',
        'Regression', 'Classification', 'Clustering', 'Anomaly Detection',
        'Risk Modeling', 'Prompt engineering', 'Prompt Engineering',
        'Computer Vision', 'NLP', 'Natural Language Processing',
        'Reinforcement Learning',
    ],
    'Architecture & Security': [
        'REST', 'REST APIs', 'RESTful APIs', 'GraphQL', 'gRPC',
        'WebSockets', 'Server-Sent Events',
        'Microservices', 'Monolith', 'Serverless', 'Service-Oriented Architecture',
        'Event-Driven', 'Event-Driven Architecture', 'Layered Architecture',
        'Domain-Driven Design', 'DDD', 'CQRS', 'Event Sourcing',
        'MVC', 'Clean Architecture', 'Hexagonal Architecture',
        'JWT', 'OAuth', 'OAuth 2.0', 'OAuth 2.0 concepts',
        'RBAC', 'ABAC', 'SAML', 'OIDC', 'mTLS', 'TLS',
        'Encryption', 'AES', 'RSA',
    ],
    'Concepts': [
        'Data Structures', 'Algorithms', 'Data Structures & Algorithms', 'DSA',
        'OOP', 'Object-Oriented Programming', 'Object Oriented Programming',
        'Functional Programming', 'FP', 'Design Patterns',
        'SOLID', 'SOLID Principles',
        'System Design', 'Concurrency', 'Multithreading',
        'Distributed Systems', 'Operating Systems', 'Computer Networks',
        'Unit Testing', 'Integration Testing', 'E2E Testing',
        'TDD', 'BDD', 'JUnit', 'Mockito', 'Pytest', 'Jest', 'Cypress',
    ],
    'Soft Skills': [
        'Leadership', 'Communication', 'Mentoring', 'Mentorship',
        'Collaboration', 'Problem solving', 'Problem Solving',
        'Critical thinking', 'Time management', 'Time Management',
        'Stakeholder management', 'Stakeholder Management',
        'Cross-functional collaboration', 'Project management',
        'Agile', 'Scrum', 'Kanban', 'Agile/Scrum',
    ],
};

// Flat lookup, lowercased, built once at module load.
const SKILL_TO_CATEGORY = (() => {
    const map = new Map();
    for (const [category, list] of Object.entries(TAXONOMY)) {
        for (const skill of list) {
            map.set(skill.toLowerCase(), category);
        }
    }
    return map;
})();

// Fuzzy fallback rules — first match wins. These cover variations that the
// exact-match map misses (e.g. "Spring Webflux 6.1" → Frameworks).
const KEYWORD_RULES = [
    { pattern: /\bspring\b/i, category: 'Frameworks' },
    { pattern: /\bjwt\b|\boauth\b|\brbac\b|\babac\b|\bsaml\b|\boidc\b|\bmtls\b/i, category: 'Architecture & Security' },
    { pattern: /microservice|hexagonal|clean[\s.-]?architecture|domain[\s.-]?driven|layered[\s.-]?architecture|event[\s.-]?driven|service[\s.-]?oriented|soa\b/i, category: 'Architecture & Security' },
    { pattern: /rest\s*api|graphql|websocket|grpc/i, category: 'Architecture & Security' },
    { pattern: /\baws\b|\bgcp\b|\bazure\b|google\s*cloud|cloud\s*platform/i, category: 'Cloud & Big Data' },
    { pattern: /docker|kubernetes|terraform|jenkins|gitlab\s*ci|github\s*action|argocd|helm/i, category: 'DevOps & Tools' },
    { pattern: /\bsql\b|nosql/i, category: 'Languages' },
    { pattern: /unit\s*test|integration\s*test|e2e\s*test|\btdd\b|\bbdd\b/i, category: 'Concepts' },
    { pattern: /data\s*structure|algorithm|\boop\b|object[\s-]?oriented|\bsolid\b|design\s*pattern/i, category: 'Concepts' },
    { pattern: /tableau|power\s*bi|looker|metabase|streamlit/i, category: 'Visualization & BI' },
    { pattern: /machine\s*learning|deep\s*learning|neural\s*network|\bml\b/i, category: 'Machine Learning' },
    { pattern: /\bagile\b|\bscrum\b|\bkanban\b/i, category: 'Soft Skills' },
];

export function categorizeSkill(skill) {
    if (!skill || typeof skill !== 'string') return null;
    const lc = skill.trim().toLowerCase();
    if (SKILL_TO_CATEGORY.has(lc)) return SKILL_TO_CATEGORY.get(lc);
    for (const rule of KEYWORD_RULES) {
        if (rule.pattern.test(lc)) return rule.category;
    }
    return null;
}

// LocalStorage flag set after the one-shot legacy "Technical Skills" split
// runs successfully. Subsequent loads skip the split so a user who manually
// creates a "Technical Skills" group isn't re-categorized against their will.
const SPLIT_LEGACY_FLAG_KEY = 'skillsAutoSplitV1';

// Top-level normalizer. Takes a mixed array of flat skills + category
// strings ("Label: a, b, c") and returns a clean category-only array with
// items bucketed by the taxonomy above.
//
// Behaviors:
// 1. Any flat skill is auto-bucketed via categorizeSkill().
// 2. Unmatched skills land in an "Other" bucket.
// 3. If the previous version of this code consolidated everything into a
//    single "Technical Skills" mega-bucket, that bucket is split *once* on
//    next load (tracked by SPLIT_LEGACY_FLAG_KEY) so the user gets the
//    benefit of the smarter categorizer without manual rework.
// 4. Items in existing categories are merged (deduplicated) rather than
//    duplicated.
export function normalizeSkills(skills) {
    if (!Array.isArray(skills) || skills.length === 0) return [];

    const categories = [];
    const flat = [];
    for (const s of skills) {
        if (typeof s !== 'string') continue;
        if (s.includes(':')) categories.push(s);
        else if (s.trim()) flat.push(s.trim());
    }

    // One-shot split of the legacy "Technical Skills" mega-bucket created by
    // the older normalizeSkills. Guarded by a localStorage flag.
    const isLegacyMegaBucket =
        categories.length === 1 &&
        /^technical skills\s*:/i.test(categories[0]) &&
        typeof localStorage !== 'undefined' &&
        !localStorage.getItem(SPLIT_LEGACY_FLAG_KEY);

    if (isLegacyMegaBucket) {
        const itemsStr = categories[0].split(/:(.+)/)[1] || '';
        flat.push(...itemsStr.split(',').map((s) => s.trim()).filter(Boolean));
        categories.length = 0;
        try { localStorage.setItem(SPLIT_LEGACY_FLAG_KEY, '1'); } catch { /* private mode */ }
    }

    if (flat.length === 0) return categories;

    // Bucket each flat skill.
    const buckets = new Map(); // categoryName → string[]
    const other = [];
    const seenLc = (arr, s) => arr.some((x) => x.toLowerCase() === s.toLowerCase());

    for (const skill of flat) {
        const bucket = categorizeSkill(skill);
        if (bucket) {
            if (!buckets.has(bucket)) buckets.set(bucket, []);
            const arr = buckets.get(bucket);
            if (!seenLc(arr, skill)) arr.push(skill);
        } else {
            if (!seenLc(other, skill)) other.push(skill);
        }
    }

    // Merge buckets into existing categories (case-insensitive label match).
    const result = [...categories];
    const mergeBucket = (label, items) => {
        const idx = result.findIndex((c) => c.split(':')[0].trim().toLowerCase() === label.toLowerCase());
        if (idx >= 0) {
            const [existingLabel, existing] = result[idx].split(/:(.+)/);
            const existingItems = (existing || '').split(',').map((s) => s.trim()).filter(Boolean);
            const merged = [...new Set([...existingItems, ...items])];
            result[idx] = `${existingLabel}: ${merged.join(', ')}`;
        } else {
            result.push(`${label}: ${items.join(', ')}`);
        }
    };
    for (const [bucket, items] of buckets.entries()) mergeBucket(bucket, items);
    if (other.length > 0) mergeBucket('Other', other);

    return result;
}

// Force re-bucket every skill from scratch. Unlike normalizeSkills, this does
// NOT preserve existing user-curated categories — it explodes them back to
// flat items, then runs the full taxonomy. Use after an AI rewrite when we
// can't trust the model to have produced a sane category structure.
export function forceCategorize(skills) {
    if (!Array.isArray(skills) || skills.length === 0) return [];

    const flat = [];
    for (const s of skills) {
        if (typeof s !== 'string') continue;
        if (s.includes(':')) {
            // Explode "Label: a, b, c" back into [a, b, c]
            const itemsStr = s.split(/:(.+)/)[1] || '';
            for (const part of itemsStr.split(',')) {
                const t = part.trim();
                if (t) flat.push(t);
            }
        } else if (s.trim()) {
            flat.push(s.trim());
        }
    }
    if (flat.length === 0) return [];

    const buckets = new Map();
    const other = [];
    const seenLc = (arr, s) => arr.some((x) => x.toLowerCase() === s.toLowerCase());

    for (const skill of flat) {
        const bucket = categorizeSkill(skill);
        if (bucket) {
            if (!buckets.has(bucket)) buckets.set(bucket, []);
            const arr = buckets.get(bucket);
            if (!seenLc(arr, skill)) arr.push(skill);
        } else if (!seenLc(other, skill)) {
            other.push(skill);
        }
    }

    const result = [];
    for (const [bucket, items] of buckets.entries()) {
        result.push(`${bucket}: ${items.join(', ')}`);
    }
    if (other.length > 0) result.push(`Other: ${other.join(', ')}`);
    return result;
}
