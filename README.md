# Spring Generate

<img src="./logo.png" width="500px"/>

## 一、介绍

``Spring Generate``是一款基于**Tauri**和**Antd**开发的**非侵入式 Spring 项目代码生成器**，他可以为你完成所有的**非定制业务**场景下的功能。目的是为了能够减少开发过程中一些重复的工作。

:eyes:例如我们有一个``User``业务，需要对这个业务分别创建``User SQL``，``UserService``、``UserMapper``、``User``、``UserController``以及对应的``CURD``接口。这些工作重复又繁琐，占用了我们大量的时间。通过这个软件，可以通过``可视化``的创建``表结构``内容，我们会根据你创建的表结构内容，自动生成``User SQL``，``UserService``、``UserMapper``、``User``和``UserController``，并且会在``Controller``中创建好相应的``CURD``接口，在``Service``中创建好常用的操作数据库的方法，省略主动编写这些代码的时间。

:exclamation:但是，请注意，这个软件并没有提供任何``ORM``框架​，也不会改动项目中的代码，只是基于某一些ROM框架，生成一些我们常写的代码。

## 二、平台

* Windows：:white_check_mark:
* Mac OS：:white_check_mark:
* Linux：:interrobang:（我们没有在这个平台中做过测试，故此标注不明确的支持程度）

## 三、运行

### 1、运行

#### 编译运行

这个软件需要使用**Node**，**Rust**和**Tauri**环境，请您分别按照《[Node.js — Run JavaScript Everywhere (nodejs.org)](https://nodejs.org/en)》，《[Rust 程序设计语言 (rust-lang.org)](https://www.rust-lang.org/zh-CN/)》和《[Build smaller, faster, and more secure desktop applications with a web frontend | Tauri Apps](https://tauri.app/zh-cn/)》搭建开发边境，并安装**Node**包管理器**Yarn**。

这一切就绪后，您可以将本仓库的代码克隆到本地，并通过以下命令启动。

**Debug 模式运行**

```text
yarn
yarn tauri dev
```

**Release模式发行**

```text
yarn
yarn tauri build
```

#### 直接运行

您可以通过我们提供的**release**包来完成下载安装，请点击**右侧的release**来下载最新版本。

### 2、启动软件

我们启动软件，看到如下界面，表示启动成功。

![](./readme-images/welcome.png)

接下来，我们将通过一个项目案例，来为您完成工具的使用讲解以及原理讲解。

## 四、开始

我们以**项目**为主题，构建一个**Spring Generate工程**。假设我们有一个项目名为“UserProject”，项目目录如下所示。

> [!Note]
>
> 我们在这里说的项目指的是**Spring Genreate项目**，而不是**Spring Boot项目**。

```text
UserProject
│
├─ gradle
├─ src
│  ├─ main
│  └─ test
├─ .gitignore
├─ build.gradle
├─ gradlew
├─ gradlew.bat
├─ HELP.md
└─ settings.gradle
```

这看起来是一个非常普通的Spring Boot项目工程，当前我们的关注点在整个项目工程中，而接下来，我们的关注点将会是在**src**目录下，因为我们所有的工作都是在这个目录下完成。

### 1、新建项目

#### （1）、项目设置

![](./readme-images/new-project-1.png)

在这个页面中，我们提供了一些需要主动设置的配置内容。其中“项目名称”，“项目包名”，“项目路径”为必填项。

> 我们建议您将

**发行日志**

> 1.0.0-patch-2
>
> * 修复了一些问题
>
> 1.0.0-patch-1
>
> * 修复了编辑字段发生的错误
> * 增加了字段名称的合法性检查
>
> 1.0.0
>
> 2024年5月7日
>
> * 提交代码，发布程序
