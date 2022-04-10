#!/usr/bin/env node
const fs = require('fs');
const { program } = require('commander');
const inquirer = require('inquirer');
const Handlebars = require('handlebars');
const download = require('download-git-repo');
const chalk = require('chalk');
const ora = require('ora');
const logSymbols = require('log-symbols');

// 弹出版本号
program.version('1.0.0');

// 定义一些模板,这些模板如果可以用api接口请求也许也不错
const templates = {
  tpl1: {
    url: 'https://github.com/zhangyachang/templace1.git',
    downloadUrl: 'https://github.com/zhangyachang/templace1#main',
    description: '模板1',
  },
  tpl2: {
    url: 'https://github.com/zhangyachang/cicdProject.git',
    downloadUrl: 'https://github.com/zhangyachang/cicdProject#main',
    description: '模板2', // 作为样例测试使用
  },
};

program
  .command('init <templateName> <projectName>')
  .description('初始化项目模板')
  .action((templateName, projectName) => {
    // console.log(templateName, projectName);
    const template = templates[templateName];
    if (typeof template === 'undefined') {
      console.log('请输入你要安装的正确的模块名称');
      return;
    }

    //  下载之前做loading提示
    var spinner = ora('正在下载模版start......').start();
    const { downloadUrl } = templates[templateName];
    // console.log('downloadUrl: ', downloadUrl);
    console.log('downloadUrl, projectName, { clone: true }', downloadUrl, projectName, { clone: true });
    // download('direct:' + downloadUrl, projectName, { clone: true }, (err) => {
    download('direct:' + downloadUrl, projectName, { clone: true }, (err) => {
      if (err) {
        console.log(err);
        spinner.fail(); // 下载失败
        console.log(logSymbols.error, chalk.red('初始化模版失败'));
        return;
      }

      // 下载成功,之后修改内容
      spinner.succeed();
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'name',
            message: '请输入项目名称',
          },
          {
            type: 'input',
            name: 'description',
            message: '请输入项目简介',
          },
          {
            type: 'input',
            name: 'author',
            message: '请输入项目作者',
          },
        ])
        .then((anwsers) => {
          // console.log('anwsers: ', anwsers);
          const packageContent = fs.readFileSync(`${projectName}/package.json`, 'utf-8');
          const packageResult = Handlebars.compile(packageContent)(anwsers);
          fs.writeFileSync(`${projectName}/package.json`, packageResult);
          console.log(logSymbols.success, chalk.yellow('初始化模版成功'));
        });
    });
  });

program
  .command('list')
  .description('查询模板')
  .action(async function () {
    for (let key in templates) {
      console.log(`${key} ${templates[key].description}`);
    }

    //  这里也可以调用接口用来查询
    // try {
    //   var spinner = ora('查询中...').start();
    //   await new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //       for (let key in templates) {
    //         console.log(`${key} ${templates[key].description}`);
    //       }
    //       spinner.succeed();
    //       resolve();
    //     }, 1000);
    //   });
    // } catch (e) {
    //   spinner.fail();
    //   console.log('报错了', e);
    // }
  });

// 前两个元素是固定的，分别是node程序的路径和脚本存放的位置
program.parse(process.argv);
