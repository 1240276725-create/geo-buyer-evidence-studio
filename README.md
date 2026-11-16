# Geo Buyer Evidence Studio

https://pixel-perfect-snapshot-5512.lovable.app请在现有 GEO 售前助手项目基础上，一次性完善「买家调研」和「客户方案」两个模块。保留现有页面风格、布局及其他模块，不要重构网站，不增加题目之外的功能。

一、买家调研模块

支持证据手动新增、编辑和删除，字段包括：证据标题、来源链接、日期、调查对象、结论。

每条证据标记为「直接证据」「间接证据」或「证据缺口」：

直接证据：直接证明美国目标工业采购人群使用 AI 寻找供应商或辅助采购。

间接证据：只能证明美国用户或企业、一般B2B买家使用AI，不能直接证明目标行业采购行为。

证据缺口：缺少目标年龄（40–60岁）、行业或实际采购行为的直接证据。

预置一条公开研究作为演示数据：

标题：Understanding the Empowered Buyer: A Playbook for Earning Trust in Today’s B2B Buyer Journey

来源：Google × National Research Group

链接：https://www.nrgmr.com/resources/Google%20B2B%20Buyer%20Journey_October_2025.pdf

日期：2025年10月

调查对象：2063名美国高级管理人员及B2B采购决策参与者。

结论：研究显示，60%的受访B2B买家在购买商业产品或服务过程中使用AI工具。

类型：间接证据。

支持判断：美国B2B采购过程中已经出现AI工具的使用行为。

局限：不能直接证明40–60岁集装箱篷房、仓库及设备租赁行业采购负责人使用AI寻找供应商。

明确展示三个证据缺口：

目标年龄人群的AI使用情况；

集装箱篷房、仓库及设备租赁行业采购人员的AI使用情况；

目标人群是否实际使用ChatGPT或Google AI寻找供应商。

展示证据支持的判断、局限及待补充证据。不得编造研究、数据或来源。没有证据时明确显示「待补充证据」。

二、客户方案模块

生成一页完整、可复制、可导出的客户方案，包含：

客户现状：读取数据诊断模块的真实计算结果，包括两个平台及整体品牌、竞品提及率。

买家调研：读取证据标题、来源、结论、证据类型和证据缺口。

采购场景建议：围绕美国集装箱篷房采购需求，展示建议覆盖的采购场景。

交付范围：读取报价模块中的核心场景数量、语种、内容覆盖周期。

报价明细：读取内容页数、内容费用、监测费用、PR待确认金额及已确认小计。

三、数据联动与验收

两个模块必须实际可操作。

客户方案必须读取数据诊断、买家调研和报价模块的同一份数据，不得写死数字。

修改场景数量、语种、内容覆盖周期、监测周期或报价后，客户方案自动同步。

默认数据能够完整展示，复制和导出功能可用。

不修改其他已完成模块，不改变现有视觉风格。

完成后检查：证据是否正确分类、缺口是否展示、客户方案中的提及率和报价是否与对应模块一致、修改报价参数后方案是否同步更新。

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://geo-buyer-evidence-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4cf1978a-2a50-4ea2-829c-39c7ebf1383a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
