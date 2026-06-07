

# FastAPI简介

### 基础部分

FastAPI是一个基于Pyhton的高性能Web框架，专门用于快速构建API接口服务



#### FastAPI的第一个程序

```python
#导入fastapi模块
from fastapi import FastAPI

#创建一个实列，实列名称为app
app = FastAPI()

#装饰器
@app.get("/")
#async 为异步方法
async def root():
    return {"message": "Hello World"}
```

在终端运行命令

```bash
uvicorn [文件名]:[实列名] 
//示列
uvicorn main:app

//--reload参数为热刷新，不需要重启项目，只需要重新保存文件即可
uvicorn main:app --reload
```



#### 路由

路由就是 URL 地址和处理函数之间的映射关系，它决定了当用户访问某个特定网址时，服务器应该执行哪段代码来返回结果。

```python
#此处"/hello"为路由地址
@app.get("/hello")
async def root():
    return {"message": "Hello World"}
```



#### 参数简介和路径参数

同一段接口逻辑，根据参数不同返回不同的数据

参数就是客户端发送请求时附带的额外信息和指令

参数的作用是让同一个接口能根据不同的输入，返回不同的输出，实现动态交互

```python
#id为参数
@app.get("/book/{id}")
async def get_book(id : int):
    return {"id" : id,"title": f"这是第{id}本书"}
```

![1779085291465](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\1779085291465.png)



##### 路径参数_Path参数注解

FastAPI允许额外的注解

| 参数 | 注解 |
|-------|:------|
| gt/ge | 大于/大于等于 |
| lt/le | 小于/小于等于 |
| description | 描述 |
| min_length /max_length | 最小长度限制/最大长度限制（用于字符类型） |
|  |  |

```python
#示列
@app.get("/book/{id}")
async def get_book(id : int = Path(..., gt = 0, le = 100, description = "书籍的id范围是1-100")):
    return {"id" : id,"title": f"这是第{id}本书"}
```



##### 查询参数

声明的参数**不是路径参数**时，路径操作函数会把该参数**自动解释为查询参数**

```python
# 查询新闻 → 分页，skip:跳过的记录数， limit:返回的记录数
@app.get("/news/news_list")
async def get_news_list(
    skip : int = Query(0,description="跳过的记录数，默认为0",lt=100), 
    limit : int = Query(10,description="返回的记录数")
    #或者以下写法
    skip : int = 0
    limit : int = 10
):
    return {"skip": skip, "limit": limit}

```

返回结果

```tex
http://127.0.0.1:8000/news/news_list?skip=10&limit=10
```

总结

查询参数出现在URL?之后，而且是【参数名】 = 【参数】的形式  ps: k1 =  v1 & k2 = v2 

python原生注解和 Query注解

##### 请求体参数_Field类型注解

在HTTP协议中，一个完整的请求由三部分组成：

① 请求行：包含方法、URL、协议版本

② 请求头：元数据信息（Content-Type、Authorization等）

③ 请求体：实际要发送的数据内容

```python
from pydantic import BaseModel,field

#注册： 用户名和密码 → str
class User(BaseModel):
    username : str = Field(default="张三", min_length=2, max_length=10,description="用户名长度必须在2-10之间")
    password : str = Field(default="123456", min_length=6, max_length=100,description="密码长度必须在6-100之间")

@app.post("/register")
async def register(user: User):
    return user
```

请求体参数的作用是创建，更新资源



#### 响应类型

默认情况下，FastAPI 会自动将路径操作函数返回的 Python 对象（字典、列表、Pydantic 模型等），经由 jsonable_encoder 转换为 JSON 兼容格式，并包装为 JSONResponse 返回。这省去了手动序列化的步骤，让开发者能更专注于业务逻辑。

如果需要返回非 JSON 数据（如 HTML、文件流），FastAPI 提供了丰富的响应类型来返回不同数据



| 响应类型          | 用途                   | 示例                              |
| ----------------- | ---------------------- | --------------------------------- |
| JSONResponse      | 默认响应，返回JSON数据 | return {"key": "value"}           |
| HTMLResponse      | 返回HTML内容           | return HTMLResponse(html_content) |
| PlainTextResponse | 返回纯文本             | return PlainTextResponse("text")  |
| FileResponse      | 返回文件下载           | return FileResponse(path)         |
| StreamingResponse | 流式响应               | 生成器函数返回数据                |
| RedirectResponse  | 重定向                 | return RedirectResponse(url)      |
|                   |                        |                                   |

##### HTTP格式

```python
from fastapi.responses import HTMLResponse

@app.get("/html", response_class=HTMLResponse)
async def get_html():
    return "<h1>这是一个HTML接口</h1>"
```



##### 文件格式

```python
from fastapi.responses import FileResponse

@app.get("/file")
async def get_file():
    file_path = "./files/1.jpg"
    return FileResponse(file_path)
```



##### 自定义响应格式

```python
#json响应格式
class News(BaseModel):
    id : int
    title : str
    content : str

@app.get("/news", response_model=News)
async def get_news(id: int):
    return {
        "id": id, 
        "title": f"这是第{id}本书", 
        "content": "这是本好书"
    }
```



#### 异常处理

对于客户端引发的错误（4xx，如资源未找到、认证失败），应使用 fastapi.HTTPSException 来中断正常处理流程，并返回标准错误响应。

```python
from fastapi import HTTPException

# 查询id，id范围为1-6
@app.get("/news/{id}")
async def get_news(id : int):
    id_list = [1, 2, 3, 4, 5, 6]
    if id not in id_list:
        # raise抛出异常
        raise HTTPException(status_code=404, detail="ID不存在")
    return {"id:" : f"{id}"}
```

### 进阶部分



#### 中间件

中间件（Middleware）是一个在每次请求进入 FastAPI 应用时都会被执行的函数。

它在请求到达实际的路径操作（路由处理函数）之前运行，并且在响应返回给客户端之前再运行一次。

![1779265473583](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\1779265473583.png)

中间件：函数的顶部使用装饰器 @app.middleware("http")

```python
@app.middleware("http")
# request 是请求 call_next 是下一个中间件或者路由处理函数
async def middleware1(request, call_next):
    print("中间件1 --start")
    response = await call_next(request)
    print("中间件1 --end")
    return response
```

运行结果

```bash
中间件1 --start
中间件1 --end
```

当有多个中间件时候

（2个）运行结果

```bash
中间件2 --start
中间件1 --start
中间件1 --end
中间件2 --end
```

总结：

中间件的作用是**为每个请求添加统一的处理逻辑（记录日志、身份认证、跨域、设置响应头、性能监控等）**

中间件的定义是**函数的顶部使用装饰器@app.middleware("http")**

中间件的执行顺序是**自下而上**



#### 依赖注入

使用依赖注入系统来共享通用逻辑，减少代码重复

注入：FastAPI 自动帮你调用依赖项，并将结果“注入”到路径操作函数中。
优点：

- 代码复用：一次编写，多处使用
- 解耦：业务逻辑与基础设施代码分离
- 易于测试：轻松地用模拟依赖替换真实依赖进行测试

```python
from fastapi import Depends

#分页参数逻辑公用，新闻列表和用户列表
async def common_parameters(
        skip : int = Query(0, ge=0),
        limit : int = Query(10, le=20)
):
    return {"skip": skip, "limit": limit}

@app.get("/news/news_list")
async def news_list(
    commons = Depends(common_parameters)
):
    return commons

@app.get("/user/user_list")
async def user_list(
    commons = Depends(common_parameters)
):
    return commons
```



## ORM



#### ORM简介

ORM（Object-RelationalMapping，对象关系映射）是一种编程技术，用于在面向对象编程语言和关系型数据库之间建立映射。它允许开发者通过操作对象的方式与数据库进行交互，而无需直接编写复杂的SQL语句。
优势：

- 减少重复的 SQL 代码
- 代码更简洁易读
- 自动处理数据库连接和事务
- 自动防止 SQL 注入攻击



#### 安装ORM

```bash
//aiomysql是异步数据库驱动

pip install "sqlalchemy[asyncio]" aiomysql
```



#### ORM建表



##### ORM创建数据库引擎

```python
# 引入引擎
from sqlalchemy.ext.asyncio import create_async_engine

#数据库+驱动://用户名:密码@地址:端口号/数据库名？[charset字符编码]
ASYNC_DATABASES_URL = "mysql+aiomysql://root:123456@localhost:3306/fastapi_test?charset=utf8"

async_engine = create_async_engine(
    ASYNC_DATABASES_URL,
    echo = True,                # 用于输出数据库日志（可选） 
    pool_size = 10,             # 设置连接池中保持的持久连接数
    max_overflow = 20           # 设置连接池允许创建的额外连接数
)
```



##### ORM定义模型类

1. 基类，继承 DeclarativeBase（包含通用属性和字段的映射）
2. 定义数据库表对应的模型类

```python
from datetime import datetime
from sqlalchemy import DateTime, Float, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# 定义模型类：基类 + 对应的模型类
# 基类：创建时间，更新时间； 书记表：id、书名、作者、价格、出版社
class Base(DeclarativeBase):
    create_time : Mapped[datetime] = mapped_column(DateTime, insert_default=func.now(), default=func.now, comment="创建时间")
    update_time : Mapped[datetime] = mapped_column(DateTime, insert_default=func.now(), default=func.now, onupdate=func.now(), comment="修改时间")

class Book(Base):
    __tablename__ = "book"
    id: Mapped[int] = mapped_column(primary_key=True, comment="书籍名称")
    bookname: Mapped[str] = mapped_column(String(255), comment="书名")
    author: Mapped[str] = mapped_column(String(255), comment="作者")
    price: Mapped[float] = mapped_column(Float, comment="价格")
    publisher: Mapped[str] = mapped_column(String(255), comment="出版社")
```

##### ORM创建数据表

1.从连接池获取异步连接，开启事务，执行ORM操作

2.FastAPI应用启动时，创建数据表

```python
# 建表：定义函数表 → FastAPI 启动的时候调用建表的函数
async def create_table():
    # 获取异步引擎，创建事务 -建表
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all) # Base 建模类的元数据创建

@asynccontextmanager
async def lifespan(app : FastAPI):
    await create_table()  # 调用建表函数
    yield
    await async_engine.dispose()  # 关闭数据库连接池

# 必须传入lifespan
app = FastAPI(
    lifespan = lifespan
)

```

#### 在路由中使用ORM

核心：创建依赖项，使用Depends注入到处理函数

 ```python
# 查询功能的接口，查询图书 → 依赖注入：创建依赖项获取数据库会话 + Depends 注入路由处理函数
AsyncSessionLocal = async_sessionmaker(
    bind = async_engine, #绑定数据库引擎
    class_=AsyncSession, #指定会话类
    expire_on_commit = False #设置会话不会过期
)

# 依赖项，用于获取数据库会话
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session               #返回数据库会话
            await session.commit()      #提交事务
        except Exception:
            await session.rollback()    #回滚事务
            raise
        finally:
            await session.close()       #关闭数据库会话
 ```

#### 查询数据

```python
await db.execute(select(模型类)),返回一个ORM对象
```

获取所有数据

```python
scalars().all()
```

获取单条数据

```python
scalars().first()
get(模型类，主键值)
scalar_one_or_none()
```

基础查询语句

```python
@app.get("/book/books")
async def get_book_list(db: AsyncSession = Depends(get_db)):
#     查询
    # result = await db.execute(select(Book))
    # book = result.scalars().all()           # 获取所有数据
    # book = result.scalars().first()           # 获取一条数据
    book = await db.get(Book,2)
    return book
```

条件查询

select(Book).where(条件, 条件2, ...)
条件：

- 比较判断：==; >; <; >=; <= 等
- 模糊查询：like()
- 与非查询：&; !; ~
- 包含查询：in_()

```python
@app.get("/book/get_book/{book_id}")
async def get_book_list(book_id: int,db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    return book

@app.get("/book/get_book")
async def get_book_list(price: float, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book).where(Book.price >= price))
    book = result.scalars().all()
    return book
```



模糊查询

```python
# 模糊查询
@app.get("/book/get_book/like")
async def get_book_list(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book).where(Book.author.like("巴%")))
    book = result.scalars().all()
    return book
```



多条件

```python
# 或与查询
@app.get("/book/get_book/or")
async def get_book_list(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book).where((Book.author.like("巴%")) | (Book.price >= 30)))
    book = result.scalars().all()
    return book
```



in_()查询

```python
# in_()包含查询
@app.get("/book/get_book/in")
async def get_book_list(db: AsyncSession = Depends(get_db)):
    id_list = [1,5,10,15,20,31]
    result = await db.execute(select(Book).where(Book.id.in_(id_list)))
    book = result.scalars().all()
    return book
```



#### 聚合查询

聚合计算：func.方法(模型类.属性)

- count: 统计行数量
- avg: 求平均值
- max: 求最大值
- min: 求最小值
- sum: 求和

```python
# 聚合查询
@app.get("/book/count")
async def get_book_count(db: AsyncSession = Depends(get_db)):
    result = await db.execute(func.count(Book.id))
    # result = await db.execute(func.max(Book.price))
    # result = await db.execute(func.min(Book.price))
    # result = await db.execute(func.avg(Book.price))
    # result = await db.execute(func.sum(Book.price))
    num = result.scalar()
    return num
```



