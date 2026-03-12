import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Очищаем БД в правильном порядке (из-за FK)
  await prisma.ideaVote.deleteMany();
  await prisma.bookReview.deleteMany();
  await prisma.bookBorrowing.deleteMany();
  await prisma.postView.deleteMany();
  await prisma.liveView.deleteMany();
  await prisma.heart.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.moodEntry.deleteMany();
  await prisma.gratitude.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.livePublication.deleteMany();
  await prisma.post.deleteMany();
  await prisma.vacancy.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  console.log('  ✅ Cleared existing data');

  // ============================================
  // ПОЛЬЗОВАТЕЛИ
  // ============================================

  const devUser = await prisma.user.create({
    data: {
      id: 'dev-user-id',
      email: 'dev@medipal.ru',
      firstName: 'Александр',
      lastName: 'Петров',
      position: 'Frontend-разработчик',
      department: 'IT',
      phone: '+7 (999) 123-45-67',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=alex',
      birthDate: new Date('1993-05-15'),
      hireDate: new Date('2021-03-01'),
      bio: 'Люблю React и TypeScript. В свободное время играю в настолки.',
      location: 'Москва',
      telegram: '@alex_petrov',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'elena.smirnova@medipal.ru',
        firstName: 'Елена',
        lastName: 'Смирнова',
        position: 'Директор по маркетингу',
        department: 'Маркетинг',
        phone: '+7 (999) 234-56-78',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=elena',
        birthDate: new Date('1988-11-22'),
        hireDate: new Date('2019-06-15'),
        bio: 'Стратег, визионер, кофеман.',
        location: 'Москва',
        telegram: '@elena_sm',
        skills: ['Маркетинг', 'Стратегия', 'Аналитика', 'PR'],
      },
    }),
    prisma.user.create({
      data: {
        email: 'ivan.kozlov@medipal.ru',
        firstName: 'Иван',
        lastName: 'Козлов',
        position: 'Backend-разработчик',
        department: 'IT',
        phone: '+7 (999) 345-67-89',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=ivan',
        birthDate: new Date('1995-03-08'),
        hireDate: new Date('2022-01-10'),
        bio: 'Go, Rust, микросервисы. Участвую в open source.',
        location: 'Санкт-Петербург',
        telegram: '@ivan_koz',
        skills: ['Go', 'Rust', 'PostgreSQL', 'Docker', 'Kubernetes'],
      },
    }),
    prisma.user.create({
      data: {
        email: 'maria.volkova@medipal.ru',
        firstName: 'Мария',
        lastName: 'Волкова',
        position: 'HR-менеджер',
        department: 'HR',
        phone: '+7 (999) 456-78-90',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=maria',
        birthDate: new Date('1991-07-14'),
        hireDate: new Date('2020-09-01'),
        bio: 'Создаю лучшую команду в индустрии!',
        location: 'Москва',
        telegram: '@maria_hr',
        skills: ['HR', 'Рекрутинг', 'Адаптация', 'Корпоративная культура'],
      },
    }),
    prisma.user.create({
      data: {
        email: 'dmitry.novikov@medipal.ru',
        firstName: 'Дмитрий',
        lastName: 'Новиков',
        position: 'Продакт-менеджер',
        department: 'Продукт',
        phone: '+7 (999) 567-89-01',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=dmitry',
        birthDate: new Date('1990-01-30'),
        hireDate: new Date('2020-02-15'),
        bio: 'Превращаю идеи в продукты. Agile-энтузиаст.',
        location: 'Москва',
        telegram: '@dmitry_pm',
        skills: ['Product Management', 'Scrum', 'UX Research', 'Data Analytics'],
      },
    }),
    prisma.user.create({
      data: {
        email: 'anna.lebedeva@medipal.ru',
        firstName: 'Анна',
        lastName: 'Лебедева',
        position: 'UX/UI-дизайнер',
        department: 'Дизайн',
        phone: '+7 (999) 678-90-12',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=anna',
        birthDate: new Date('1994-09-05'),
        hireDate: new Date('2021-07-01'),
        bio: 'Pixel perfect. Figma advocate.',
        location: 'Москва',
        telegram: '@anna_design',
        skills: ['Figma', 'UX Research', 'UI Design', 'Design Systems'],
      },
    }),
    prisma.user.create({
      data: {
        email: 'sergey.morozov@medipal.ru',
        firstName: 'Сергей',
        lastName: 'Морозов',
        position: 'Финансовый аналитик',
        department: 'Финансы',
        phone: '+7 (999) 789-01-23',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=sergey',
        birthDate: new Date('1989-12-18'),
        hireDate: new Date('2018-04-10'),
        bio: 'Цифры — мой язык.',
        location: 'Москва',
        telegram: '@sergey_fin',
        skills: ['Excel', 'SQL', 'Power BI', 'Финансовое моделирование'],
      },
    }),
    prisma.user.create({
      data: {
        email: 'olga.kuznetsova@medipal.ru',
        firstName: 'Ольга',
        lastName: 'Кузнецова',
        position: 'QA-инженер',
        department: 'IT',
        phone: '+7 (999) 890-12-34',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=olga',
        birthDate: new Date('1996-04-22'),
        hireDate: new Date('2023-02-01'),
        bio: 'Ломаю всё, чтобы работало правильно.',
        location: 'Казань',
        telegram: '@olga_qa',
        skills: ['Playwright', 'Postman', 'SQL', 'Python'],
      },
    }),
    prisma.user.create({
      data: {
        email: 'nikita.fedorov@medipal.ru',
        firstName: 'Никита',
        lastName: 'Фёдоров',
        position: 'DevOps-инженер',
        department: 'IT',
        phone: '+7 (999) 901-23-45',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=nikita',
        birthDate: new Date('1992-08-11'),
        hireDate: new Date('2021-11-15'),
        bio: 'Автоматизирую всё. Terraform, K8s, CI/CD.',
        location: 'Москва',
        telegram: '@nikita_devops',
        skills: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'AWS'],
      },
    }),
  ]);

  console.log(`  ✅ Created ${users.length + 1} users`);

  const allUsers = [devUser, ...users];

  // ============================================
  // НОВОСТИ (Posts)
  // ============================================

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        type: 'NEWS',
        title: 'Запуск нового корпоративного портала',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Мы рады представить обновлённый корпоративный портал МЕДИПАЛ.' }] }] },
        contentHtml: '<p>Мы рады представить обновлённый корпоративный портал МЕДИПАЛ. Новая версия включает современный интерфейс, банк идей, дневник настроения и многое другое. Портал создан для того, чтобы сделать нашу рабочую жизнь удобнее и продуктивнее.</p>',
        tags: ['портал', 'обновление', 'IT'],
        authorId: devUser.id,
        status: 'PUBLISHED',
        isMain: true,
        publishedAt: new Date('2026-03-10'),
      },
    }),
    prisma.post.create({
      data: {
        type: 'NEWS',
        title: 'Итоги квартала: рост выручки на 23%',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Подводим итоги первого квартала 2026 года.' }] }] },
        contentHtml: '<p>Подводим итоги первого квартала 2026 года. Выручка компании выросла на 23% по сравнению с аналогичным периодом прошлого года. Это стало возможным благодаря слаженной работе всех отделов и запуску новых продуктов.</p>',
        tags: ['финансы', 'итоги', 'рост'],
        authorId: users[6].id, // Сергей
        status: 'PUBLISHED',
        publishedAt: new Date('2026-03-08'),
      },
    }),
    prisma.post.create({
      data: {
        type: 'NEWS',
        title: 'Новая программа обучения для сотрудников',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Запускаем программу профессионального развития.' }] }] },
        contentHtml: '<p>Запускаем программу профессионального развития "Рост 360°". Каждый сотрудник может выбрать до 3 курсов в год за счёт компании. Каталог включает IT-курсы, soft skills, языковые программы и многое другое.</p>',
        tags: ['обучение', 'HR', 'развитие'],
        authorId: users[2].id, // Мария
        status: 'PUBLISHED',
        publishedAt: new Date('2026-03-05'),
      },
    }),
    prisma.post.create({
      data: {
        type: 'ANNOUNCEMENT',
        title: 'Корпоратив 28 марта — не пропустите!',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Приглашаем на весенний корпоратив!' }] }] },
        contentHtml: '<p>Приглашаем на весенний корпоратив! 28 марта, 18:00, ресторан "Веранда". В программе: музыка, конкурсы, вручение наград лучшим сотрудникам квартала. Регистрация через портал до 25 марта.</p>',
        tags: ['корпоратив', 'мероприятие'],
        authorId: users[2].id, // Мария
        status: 'PUBLISHED',
        isPinned: true,
        publishedAt: new Date('2026-03-11'),
      },
    }),
    prisma.post.create({
      data: {
        type: 'ARTICLE',
        title: 'Как мы перешли на микросервисы: опыт команды',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Делимся опытом перехода с монолита на микросервисную архитектуру.' }] }] },
        contentHtml: '<p>Делимся опытом перехода с монолита на микросервисную архитектуру. За 6 месяцев мы разбили монолит на 12 сервисов, настроили CI/CD и мониторинг. Время деплоя сократилось с 40 минут до 3. Рассказываем о подводных камнях и как их обходить.</p>',
        tags: ['IT', 'архитектура', 'микросервисы', 'DevOps'],
        authorId: users[8].id, // Никита
        status: 'PUBLISHED',
        publishedAt: new Date('2026-03-03'),
      },
    }),
  ]);

  console.log(`  ✅ Created ${posts.length} posts`);

  // ============================================
  // LIVE ПУБЛИКАЦИИ
  // ============================================

  const livePublications = await Promise.all([
    prisma.livePublication.create({
      data: {
        title: 'Хакатон "Инновации 2026"',
        description: 'Наша команда заняла 1 место на внутреннем хакатоне! За 48 часов мы создали прототип AI-ассистента для HR. Спасибо всем участникам за невероятную энергию и креатив!',
        imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
        category: 'CORPORATE',
        tags: ['хакатон', 'инновации', 'AI'],
        authorId: devUser.id,
      },
    }),
    prisma.livePublication.create({
      data: {
        title: 'Футбольный матч IT vs Маркетинг',
        description: 'Весёлый матч закончился со счётом 3:2 в пользу IT! Но настоящий победитель — командный дух. Фотоотчёт прилагается.',
        imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
        category: 'SPORT',
        tags: ['футбол', 'спорт', 'команда'],
        authorId: users[1].id,
      },
    }),
    prisma.livePublication.create({
      data: {
        title: 'Мастер-класс по керамике',
        description: 'Провели творческий вечер — лепили из глины! Каждый участник забрал домой уникальную кружку. Следующий мастер-класс — рисование акрилом, 20 марта.',
        imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
        category: 'CREATIVE',
        tags: ['творчество', 'керамика', 'мастер-класс'],
        authorId: users[4].id,
      },
    }),
    prisma.livePublication.create({
      data: {
        title: 'Субботник в парке Горького',
        description: 'Посадили 15 деревьев и убрали территорию. Отличная погода, отличная команда! Фото и видео — в канале @medipal_eco.',
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
        category: 'VOLUNTEER',
        tags: ['волонтёрство', 'экология', 'субботник'],
        authorId: users[2].id,
      },
    }),
  ]);

  console.log(`  ✅ Created ${livePublications.length} live publications`);

  // ============================================
  // ВАКАНСИИ
  // ============================================

  const vacancies = await Promise.all([
    prisma.vacancy.create({
      data: {
        title: 'Senior Frontend Developer',
        department: 'IT',
        location: 'Москва / Remote',
        description: 'Ищем опытного фронтенд-разработчика для развития корпоративных продуктов.',
        responsibilities: ['Разработка UI на React/TypeScript', 'Code review', 'Менторинг junior-разработчиков', 'Участие в архитектурных решениях'],
        requirements: ['3+ лет с React', 'TypeScript', 'Опыт с Redux/Zustand', 'Понимание CI/CD'],
        conditions: ['Гибридный формат', 'ДМС с первого дня', 'Обучение за счёт компании', 'MacBook Pro'],
        employmentType: 'FULL_TIME',
        experience: '3-5 лет',
        isHot: true,
      },
    }),
    prisma.vacancy.create({
      data: {
        title: 'Product Designer',
        department: 'Дизайн',
        location: 'Москва',
        description: 'Присоединяйтесь к дизайн-команде для создания продуктов, которыми пользуются тысячи людей.',
        responsibilities: ['Проектирование интерфейсов', 'Проведение UX-исследований', 'Работа с дизайн-системой', 'Прототипирование'],
        requirements: ['2+ лет в продуктовом дизайне', 'Figma на уровне эксперта', 'Понимание фронтенд-разработки'],
        conditions: ['Офис в центре', 'ДМС', 'Бесплатные обеды'],
        employmentType: 'FULL_TIME',
        experience: '2-4 года',
        isHot: false,
      },
    }),
    prisma.vacancy.create({
      data: {
        title: 'Data Analyst',
        department: 'Аналитика',
        location: 'Remote',
        description: 'Ищем аналитика для построения data-driven культуры в компании.',
        responsibilities: ['Построение дашбордов', 'A/B тестирование', 'Анализ пользовательского поведения', 'SQL-запросы и отчёты'],
        requirements: ['SQL', 'Python', 'BI-инструменты (Power BI / Tableau)', 'Статистика'],
        conditions: ['Полностью удалённый формат', 'Гибкий график', 'ДМС'],
        employmentType: 'FULL_TIME',
        experience: '1-3 года',
        isHot: true,
      },
    }),
  ]);

  console.log(`  ✅ Created ${vacancies.length} vacancies`);

  // ============================================
  // БИБЛИОТЕКА
  // ============================================

  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: 'Чистый код',
        author: 'Роберт Мартин',
        description: 'Классическая книга о написании качественного, поддерживаемого кода. Обязательна к прочтению для каждого разработчика.',
        coverUrl: 'https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg',
        category: 'IT',
        pageCount: 464,
        year: 2008,
        tags: ['программирование', 'best practices', 'рефакторинг'],
        isFeatured: true,
        status: 'AVAILABLE',
      },
    }),
    prisma.book.create({
      data: {
        title: 'Атомные привычки',
        author: 'Джеймс Клир',
        description: 'Как маленькие изменения приводят к большим результатам. Практическое руководство по формированию полезных привычек.',
        coverUrl: 'https://images-na.ssl-images-amazon.com/images/I/51-nXsSRfZL._SX328_BO1,204,203,200_.jpg',
        category: 'SELF_DEVELOPMENT',
        pageCount: 320,
        year: 2018,
        tags: ['привычки', 'продуктивность', 'саморазвитие'],
        isFeatured: true,
        isNew: true,
        status: 'AVAILABLE',
      },
    }),
    prisma.book.create({
      data: {
        title: 'Думай медленно... решай быстро',
        author: 'Даниэль Канеман',
        description: 'Нобелевский лауреат о двух системах мышления и типичных когнитивных ловушках.',
        coverUrl: 'https://images-na.ssl-images-amazon.com/images/I/41wI53OEpCL._SX322_BO1,204,203,200_.jpg',
        category: 'PSYCHOLOGY',
        pageCount: 499,
        year: 2011,
        tags: ['психология', 'мышление', 'принятие решений'],
        status: 'BORROWED',
      },
    }),
    prisma.book.create({
      data: {
        title: 'От нуля к единице',
        author: 'Питер Тиль',
        description: 'Как создать стартап, который изменит будущее. Книга одного из самых успешных инвесторов Кремниевой долины.',
        category: 'BUSINESS',
        pageCount: 195,
        year: 2014,
        tags: ['стартап', 'бизнес', 'инновации'],
        status: 'AVAILABLE',
      },
    }),
    prisma.book.create({
      data: {
        title: 'Проектирование веб-API',
        author: 'Арно Лоре',
        description: 'Практическое руководство по проектированию API, которые удобны в использовании и легко поддерживаются.',
        category: 'IT',
        pageCount: 392,
        year: 2019,
        tags: ['API', 'REST', 'архитектура'],
        isNew: true,
        status: 'AVAILABLE',
      },
    }),
  ]);

  // Создаём запись о взятии книги
  await prisma.bookBorrowing.create({
    data: {
      bookId: books[2].id, // Канеман
      userId: users[3].id, // Дмитрий
      returnDate: new Date('2026-04-05'),
    },
  });

  console.log(`  ✅ Created ${books.length} books`);

  // ============================================
  // БАНК ИДЕЙ
  // ============================================

  const ideas = await Promise.all([
    prisma.idea.create({
      data: {
        title: 'Внедрить AI-помощника для HR',
        description: 'Создать чат-бота на базе LLM, который поможет сотрудникам находить ответы на частые вопросы по HR-процессам: отпуска, ДМС, обучение, зарплата.',
        status: 'REVIEW',
        category: 'TECH',
        tags: ['AI', 'HR', 'автоматизация'],
        authorId: devUser.id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Пятничные демо-сессии',
        description: 'Каждую пятницу в 16:00 — 30-минутные демо от разных команд. Это поможет делиться опытом и узнавать, чем занимаются коллеги.',
        status: 'APPROVED',
        category: 'CULTURE',
        tags: ['команда', 'обмен опытом', 'демо'],
        authorId: users[3].id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Тихие зоны в офисе',
        description: 'Выделить отдельные зоны для сосредоточенной работы без разговоров и звонков. Поможет повысить продуктивность.',
        status: 'NEW',
        category: 'PROCESS',
        tags: ['офис', 'продуктивность'],
        authorId: users[4].id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Мобильное приложение портала',
        description: 'Разработать мобильную версию корпоративного портала для iOS и Android. Push-уведомления о новостях и событиях.',
        status: 'NEW',
        category: 'PRODUCT',
        tags: ['мобильное приложение', 'портал', 'UX'],
        authorId: users[1].id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Геймификация обучения',
        description: 'Добавить систему достижений и рейтинг за прохождение обучающих курсов. Мотивация через игровые механики.',
        status: 'IMPLEMENTED',
        category: 'CULTURE',
        tags: ['обучение', 'геймификация', 'мотивация'],
        authorId: users[2].id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Система менторинга',
        description: 'Запустить программу менторинга, где опытные сотрудники помогают новичкам адаптироваться и расти. Матчинг по навыкам и интересам.',
        status: 'REVIEW',
        category: 'CULTURE',
        tags: ['менторинг', 'рост', 'адаптация'],
        authorId: users[2].id,
      },
    }),
  ]);

  // Голоса за идеи
  for (const idea of ideas) {
    const voterCount = Math.floor(Math.random() * 6) + 1;
    const shuffled = [...allUsers].sort(() => Math.random() - 0.5);
    for (let i = 0; i < voterCount && i < shuffled.length; i++) {
      try {
        await prisma.ideaVote.create({
          data: {
            ideaId: idea.id,
            userId: shuffled[i].id,
          },
        });
      } catch {
        // unique constraint — skip
      }
    }
  }

  console.log(`  ✅ Created ${ideas.length} ideas with votes`);

  // ============================================
  // БЛАГОДАРНОСТИ
  // ============================================

  const gratitudes = await Promise.all([
    prisma.gratitude.create({
      data: {
        fromId: devUser.id,
        toId: users[1].id,
        message: 'Спасибо за помощь с настройкой CI/CD! Без тебя бы не справился за один день.',
      },
    }),
    prisma.gratitude.create({
      data: {
        fromId: users[3].id,
        toId: devUser.id,
        message: 'Отличная работа над новым интерфейсом портала! Всё выглядит просто великолепно.',
      },
    }),
    prisma.gratitude.create({
      data: {
        fromId: users[0].id,
        toId: users[2].id,
        message: 'Благодарю за оперативную помощь с оформлением нового сотрудника. Профессионализм на высоте!',
      },
    }),
    prisma.gratitude.create({
      data: {
        fromId: users[4].id,
        toId: users[0].id,
        message: 'Спасибо за потрясающий дизайн маркетинговых материалов к конференции!',
      },
    }),
    prisma.gratitude.create({
      data: {
        fromId: users[7].id,
        toId: users[8].id,
        message: 'Спасибо за быструю помощь с деплоем в прод. Настоящий профи!',
      },
    }),
  ]);

  console.log(`  ✅ Created ${gratitudes.length} gratitudes`);

  // ============================================
  // ДНЕВНИК НАСТРОЕНИЯ
  // ============================================

  const moodValues = ['GREAT', 'GOOD', 'OKAY', 'BAD', 'AWFUL'] as const;
  const moodTags = [
    ['продуктивность', 'энергия'],
    ['работа', 'команда'],
    ['усталость'],
    ['спорт', 'здоровье'],
    ['обучение'],
    ['отдых', 'хобби'],
  ];

  const moodEntries = [];
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));

    const weights = [0.25, 0.35, 0.25, 0.1, 0.05];
    const rand = Math.random();
    let cumulative = 0;
    let moodIdx = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) { moodIdx = i; break; }
    }

    const notes = [
      'Продуктивный день! Закрыл все задачи из спринта.',
      'Хороший созвон с командой, определили приоритеты.',
      'Обычный рабочий день, ничего особенного.',
      'Много встреч, устал. Нужно отдохнуть.',
      'Написал классный компонент, горжусь результатом!',
      'Сходил на обед с коллегами, поднял настроение.',
      null,
    ];

    moodEntries.push(
      prisma.moodEntry.create({
        data: {
          userId: devUser.id,
          mood: moodValues[moodIdx],
          note: notes[Math.floor(Math.random() * notes.length)],
          tags: moodTags[Math.floor(Math.random() * moodTags.length)],
          recordedAt: date,
        },
      })
    );
  }

  await Promise.all(moodEntries);
  console.log(`  ✅ Created ${moodEntries.length} mood entries`);

  // ============================================
  // ДОСТИЖЕНИЯ
  // ============================================

  await Promise.all([
    prisma.achievement.create({
      data: {
        title: 'Первый коммит',
        description: 'Сделал первый коммит в корпоративный репозиторий',
        userId: devUser.id,
      },
    }),
    prisma.achievement.create({
      data: {
        title: 'Идейный вдохновитель',
        description: 'Предложил 5 идей в банк идей',
        userId: devUser.id,
      },
    }),
    prisma.achievement.create({
      data: {
        title: 'Книжный червь',
        description: 'Прочитал 3 книги из корпоративной библиотеки',
        userId: users[3].id,
      },
    }),
  ]);

  console.log('  ✅ Created achievements');

  // ============================================
  // ЛАЙКИ И КОММЕНТАРИИ
  // ============================================

  for (const post of posts) {
    const likerCount = Math.floor(Math.random() * 5) + 2;
    const shuffled = [...allUsers].sort(() => Math.random() - 0.5);
    for (let i = 0; i < likerCount && i < shuffled.length; i++) {
      try {
        await prisma.like.create({
          data: { userId: shuffled[i].id, postId: post.id },
        });
      } catch { /* unique constraint */ }
    }
  }

  await prisma.comment.create({
    data: {
      content: 'Отличная новость! Портал выглядит супер.',
      authorId: users[0].id,
      postId: posts[0].id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Когда будет мобильная версия?',
      authorId: users[3].id,
      postId: posts[0].id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Поздравляю всех! Отличные результаты.',
      authorId: users[2].id,
      postId: posts[1].id,
    },
  });

  console.log('  ✅ Created likes and comments');

  console.log('\n🎉 Seeding completed successfully!');
  console.log(`   Total users: ${allUsers.length}`);
  console.log(`   Total posts: ${posts.length}`);
  console.log(`   Total live publications: ${livePublications.length}`);
  console.log(`   Total vacancies: ${vacancies.length}`);
  console.log(`   Total books: ${books.length}`);
  console.log(`   Total ideas: ${ideas.length}`);
  console.log(`   Total gratitudes: ${gratitudes.length}`);
  console.log(`   Total mood entries: ${moodEntries.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
