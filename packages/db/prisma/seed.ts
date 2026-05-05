import prisma from "@osint-rag/db";

async function main() {
  await prisma.document.createMany({
    data: [
      {
        sourceType: "manual",
        sourceName: "SCMP",
        url: "https://www.scmp.com/opinion/asia-opinion/article/3351940/how-ai-boom-helping-asia-weather-iran-war-energy-shock",
        publishedAt: new Date("2026-04-30"),
        title: "How the AI boom is helping Asia weather the Iran war energy shock",
        author: "Nicholas Spiro",
        externalId: "scmp-3351940",
        rawText: `The war in Iran might as well be over for investors as positive sentiment, strong corporate earnings and the AI boom lift Asian markets

For financial markets, the war in Iran and the energy shock that ensued might as well be over. Since March 30, the benchmark S&P 500 equity index has surged 12.5 per cent, exceeding the record high reached on January 27. Global shares have also bounced back sharply. The MSCI All-Country World Index ex US, a gauge of international stocks that excludes the United States, is less than 4 per cent below its all-time high on February 25.

Several factors are at play. Most investors evidently believe the worst of the war is over. Neither the US nor Iran has much appetite for resuming large-scale hostilities. Citadel Securities said the most likely outcome is a deal that is “less of a comprehensive agreement and more of a freezing arrangement designed to buy time, reduce immediate escalation risk and stabilise oil markets without resolving the underlying dispute”.

Another key factor is strong growth in corporate earnings. According to Societe Generale, global stocks’ projected earnings per share this year are 12 per cent higher than at the start of this year, “the largest upward revision on record outside of a post-recession recovery”.

Much of the increase is attributable to the semiconductor and technology hardware sectors. While divergent views on the risks posed by the boom in artificial intelligence have unnerved stock markets, investors are increasingly bullish on semiconductor stocks. Chipmakers are seen as the immediate beneficiaries of the AI boom as the global buildout of data centres fuels demand for memory chips.

That the rally is particularly pronounced in parts of Asia – the region most exposed to the energy crisis given its heavy reliance on imports of oil, gas and refined petroleum products from the Middle East – shows the degree to which the war is no longer the chief determinant of sentiment.

Since March 31, the MSCI All Country Asia-Pacific Index has risen nearly 14 per cent, leaving it just 1.5 per cent shy of its all-time high on February 27. The rebound is all the more striking given mounting concerns about the economic fallout from the energy crisis.

Asia’s vulnerability to supply disruptions is a major theme in Wall Street banks’ research reports. Last week, JPMorgan launched a new series of reports assessing the economic impact of the shock across the region. Policy responses include a full-blown state of emergency in the Philippines, fuel rationing and flight capacity reductions in several Asian countries, curbs on energy exports and mandatory work-from-home policies for civil servants in Indonesia and Malaysia.

Asian refineries are cutting production, squeezing the supply of jet fuel and other refined products and contributing to higher prices just as the summer travel season approaches.

The results of Bank of America’s latest Asia fund manager survey on April 14 showed that a net 55 per cent of respondents were bearish on the growth outlook for the Asia-Pacific while 77 per cent expected higher inflation. “Energy security risks dominate investor concerns, with 91 per cent highly or extremely worried,” Bank of America said.

However, while fund managers were downbeat on Southeast Asian markets, they were bullish on North Asia, particularly Japan and Taiwan. A divide has opened up between the semiconductor-heavy North Asian stock markets and their Southeast Asian peers that are at a disadvantage because of the region’s inadequate energy supply buffers and the lack of a strong presence in the supply chains of the so-called hyperscalers building data centres.

A cursory glance at the composition of the MSCI All-Country Asia-Pacific Index shows the extent to which the Taiwanese and South Korean equity markets, both heavily weighted towards chipmakers, have an outsize influence on the performance of Asian stocks and emerging markets more broadly. The two combined make up more than a quarter of the index, with Taiwan Semiconductor Manufacturing Company and South Korea’s Samsung Electronics and SK Hynix constituting nearly 15 per cent of the gauge’s market capitalisation.

South Korean exports rose nearly 50 per cent in annualised terms in the first three weeks of April, with chip exports up a staggering 183 per cent. In Taiwan, exports rose 66 per cent in March – the fastest pace since 2010 – amid voracious demand for AI-related products. JPMorgan said the chip boom dispelled fears that “the AI cycle would be interrupted because of energy shortages”.

China’s relative insulation from the energy shock has contributed to the shift in sentiment towards Asia. Years of deliberate planning to reduce external dependencies and vulnerabilities are paying off. Moreover, China has its own AI narrative, underpinned by abundant and cheap power. A report in February by the Oxford Institute for Energy Studies said, “China faces no electricity supply barrier to data centre growth, at least at a national level”.

Even in India, whose share of energy imports from the Middle East is one of the highest in Asia, the strength of domestic demand is acting as a shock-absorber. In a report on April 27, Nomura said that “hard data suggest consumer and investment demand have held up”. Although India’s equity market has struggled to recover, domestic investors, especially retail investors, continue to act as a key pillar of support.

It’s still early days. The energy crisis is deepening, increasing the risk of stagflation. Even so, this is not the first time economists and investors have underestimated Asia’s resilience. While the AI boom itself poses risks, it is helping Asia weather the energy shock.`,
      },
      {
        sourceType: "manual",
        sourceName: "SCMP",
        title:
          "How China’s industrial tourism boom is creating a new generation of tech-savvy children",
        url: "https://www.scmp.com/economy/china-economy/article/3352023/how-chinas-industrial-tourism-boom-creating-new-generation-tech-savvy-children",
        author: "He Huifeng",
        externalId: "scmp-3352023",
        publishedAt: new Date("2026-05-05"),
        rawText: `The world deserves better than a monopoly that builds walls and hobbles development

In global discourse, a script has been handed to us: the United States and China are locked in a “tech race”. But this is really a misnomer. True competition requires a level playing field. When one runner trips the other to ensure victory, it’s not a competition; it’s cheating.

So, when Washington deploys an arsenal of sanctions, export controls and diplomatic strong-arming to hamstring China’s technological ascent, it is not competing. It is an act of suppression.

This reflects a deliberate strategy to preserve American supremacy in the technologies of the future. Take 6G for example. Washington’s intent is clear: by bundling development with “trusted” supply chains and alliance politics, it is working to build a new global regime centred on US-led standards and closed loops, rather than a universal, open-access model.

The US obsession with retaining its crown is not rooted in advancing humanity’s collective interests; it is about preserving a monopoly. The US has used patent barriers, export bans and price gouging to act as the gatekeeper of modernisation.

As a result, the spread of technology is channelled through a system of sluice gates. This systematic hindrance builds a high wall, shutting out the Global South and locking developing nations permanently at the bottom of the global value chain.

The impact on the Global South is a daily reality of exclusion. Nowhere is this more visible than in agriculture.

American giants have weaponised intellectual property laws to monopolise seeds. This forces African farmers into a cycle of debt, buying seeds at inflated prices while being blocked from traditional replanting practices. In South Africa, many smallholders have been forced to the brink of bankruptcy through the planting of genetically modified seeds that are ill-suited to local weather and require patented chemical fertiliser and pesticides.

In Burkina Faso, after adopting Monsanto’s genetically modified organism (GMO) seeds in 2008, farmers sank into debt because they had to consistently buy new seeds and pay royalties. In Nigeria, hundreds of farmers’ organisations and civil society groups joined forces to call for a ban on GMOs, claiming they threaten livelihoods.

The information sector tells a similar story. From the 1970s to the 1980s, the Brazilian information sector experienced robust development. Local manufacturers accounted for 80 per cent of the domestic market. Cobra, a Brazilian computer manufacturer founded in 1974, was second only to IBM by 1984. It had the most microcomputers after the US and Japan.

Yet, Washington’s actions crushed the thriving industry. In 1985, the Ronald Reagan administration launched a Section 301 investigation and waged a trade war that led to Brazil opening up its market to US firms.

US tech dominance also means exorbitant prices for some healthcare. American pharmaceutical giants have leveraged patents to monopolise raw materials like hyaluronic acid – used in cataract surgery – driving prices sky-high. As a result, poorer people in Africa and Southeast Asia have been deprived of surgery that could prevent them from going blind.

American technological supremacy also poses security risks. The weaponisation of surveillance tools undermines the digital sovereignty of the Global South. Whistle-blower Edward Snowden’s revelations exposed how the US National Security Agency spied on countries from Brazil to India. So when Washington puts restrictions on Huawei’s 5G, the real concern is clear: if countries switch to Chinese telecoms, America loses its ability to snoop on their people and leaders.

Moreover, American military technological supremacy has emboldened Washington to wage wars with impunity: invading Iraq, on false pretences of Baghdad possessing weapons of mass destruction; kidnapping Venezuelan President Nicolas Maduro and his wife; and assassinating Iranian Supreme Leader Ayatollah Ali Khamenei (in a joint operation with Israel), as well as bombing Iranian bridges, hospitals, universities, power plants and factories.

Indeed, being a technological laggard is tantamount to letting Washington assert its dominance, leaving many countries in constant fear. Even allies such as Canada and Denmark have not been spared from attempted coercion.

In contrast, China offers a stark, refreshing alternative: a tech path that is open, inclusive and focused on lifting everyone up. Instead of hoarding tech, China shares it – turning once-unaffordable innovations into tools for shared progress.

In solar energy, China’s large-scale production has sliced panel prices by over 90 per cent, making solar power cheaper than fossil fuels in sun-drenched regions worldwide. With 80 per cent of the global solar panel market, China isn’t just selling affordable, high-quality products, it is also sharing its expertise with other developing countries.

In Nigeria, for example, the transfer of complete solar panel production technology has enabled the construction of a local manufacturing plant that produces hundreds of thousands of panels yearly, enabling the country to power rural homes with locally made solar energy.

In agricultural technology, Chinese and Kenyan scientists have developed drought-resistant seeds that have boosted yields by 50 per cent for farmers, and trained a number of agronomists, as the East African country cuts dependency on agricultural imports.

In artificial intelligence, China embraces open-source methods as a pathway, with largely free commercial use, to democratise access.

Technology’s value lies in diffusion, adaptation and shared progress. If Washington keeps weaponising technology, building walls and prioritising control, it will not only stifle global advancement but also isolate itself from future innovation. True leadership is not about hoarding power; it is about lifting others up. The world deserves better than a monopoly that leaves developing countries in the dust.`,
      },
      {
        sourceName: "SCMP",
        sourceType: "manual",
        externalId: "scmp-3346406",
        title: "Hong Kong job openings hit 6-year low in 69% of sectors amid AI's ascent",
        publishedAt: new Date("2026-03-13"),
        url: "https://www.scmp.com/news/hong-kong/hong-kong-economy/article/3346406/hong-kong-job-openings-hit-6-year-low-69-sectors-amid-ais-ascent",
        author: "Theodora Yu",
        rawText: `Vacancies in 23 out of 33 job sectors, including IT and customer service, fell to their lowest number in six years

Hong Kong’s fresh graduates are facing increasingly challenging career prospects, with 69 per cent of job sectors recording their fewest vacancies in six years, a trend experts attribute to the rise of artificial intelligence (AI) and a sluggish economy.

Figures from the Joint Institution Job Information System, a centralised online job information platform shared by the city’s eight publicly funded universities, also showed that the number of job vacancies fell to a five-year low of 30,798 last year, down by 51.5 per cent from 2021.

In 2025, 23 out of 33 job sectors – 69 per cent – recorded their lowest number of vacancies in six years.

Industries with fewer job openings were those heavily associated with the use of artificial intelligence, such as information technology and programming, customer service, and administrative or clerical work.

In the 2024-25 academic year, the eight publicly funded universities in Hong Kong produced 29,676 graduates in total, with nearly 75 per cent, or 22,255 students, earning undergraduate degrees.

By comparison, during 2020-21, which coincided with the Covid-19 pandemic, the total number of graduates was slightly lower at 28,861, of whom 77 per cent or 22,333 students, were undergraduates.

Michael Chau, professor in innovation and information management at the University of Hong Kong’s HKU Business School, said AI was likely to be a contributing factor to the limited job opportunities for fresh graduates, alongside broader macroeconomic challenges.

“Artificial intelligence can do more clerical work than before, and every industry always has some paperwork,” Chau said.

He also noted that the economy had worsened during the pandemic.

“Some industries may have cut staff and therefore created more job openings to hire cheaper manpower … others may have hired more people after the pandemic, particularly those that received government subsidies,” he said.

The information technology and programming sector, which once offered a high volume of opportunities for graduates with 8,251 vacancies in 2020, saw its demand plummet by 66.7 per cent to just 2,749 last year.

Chau attributed part of the decline in programming jobs to the growing use of AI, which was capable of generating code rapidly.

“It is interesting as AI was written by programmers, but now AI can write its own programmes,” he said.

The customer service sector in retail, hotel and tourism also saw a sharp decline, with vacancies plummeting by 54.3 per cent from 3,763 in 2020 to 1,720 in 2025, according to the joint job platform.

Alexa Chow Yee-ping, managing director of ACTS Consulting, said AI had become more deeply integrated into customer services.

Many general questions now receive standardised replies from AI chatbots, she explained, allowing companies to reserve staff for handling more complex inquiries.

Chow added that roles such as junior financial analysts and bookkeeping – which frequently involve data analysis – were among those most easily replaced by AI.

But while AI can generate data analysis quickly, it is not equipped with analysis capabilities or decision-making that require human judgment over business relationships, according to Chow.

“When it comes to the management style, workplace culture or even the boss’s personality … we have to rely on people to make decisions,” she said.

Despite the challenges, the rise of AI might also create new roles and industries, Chau said.

He cited positions such as AI developers and repair engineers, model trainers and manufacturers of hardware or downstream products as emerging opportunities.

“A few decades ago, few people would have imagined cybersecurity as a job before the era of the internet … or being a YouTuber or Uber driver,” Chau said.

And while AI might also influence or change how many jobs operate, the professions were likely to remain, Chau said, citing the relatively more stable vacancy levels of medical practitioners and teachers reflected in the data.

“E-learning has been going on for ages, but there is still a need for teachers,” he said. “The role of teacher will transform as time passes and more new technology emerges, but it will remain.”

He added that the programming field would continue to exist, with perhaps fewer roles in the future, as people used AI to manage workflows.

“In the end, you still need a person to actually do the work,” Chau said.

To remain competitive, it was crucial to be equipped for jobs that required specialised judgment, which AI struggled to replicate, Chow said.

Jobs that involved analysing human behaviour, such as psychologists or counsellors, were also less likely to be replaced by AI, he said.

“Can AI fully understand or resonate with a human being? No,” Chow said.

For Chau, the key to staying ahead of the curve is to keep learning how to use AI, while strengthening communication skills and remaining adaptable.

“As long as you keep learning and stay up to date, you don’t have to be too afraid … even if you change jobs,” Chau said.

Last month, Financial Secretary Paul Chan Mo-po announced in the government’s budget the roll-out of an “AI+ Strategy”, which included initiatives to promote AI literacy across all sectors of society.`,
      },
      {
        url: "https://www.scmp.com/news/hong-kong/hong-kong-economy/article/3346409/i-cant-get-job-and-ai-blame-young-persons-lament",
        externalId: "scmp-3346409",
        author: "Harvey Kong",
        publishedAt: new Date("2026-03-13"),
        sourceType: "manual",
        sourceName: "SCMP",
        title: "‘I can’t get a job and AI is to blame’: a young person’s lament",
        rawText: `Rapid advances in AI are fuelling fears among Hong Kong’s fresh graduates that machines could replace them before their careers begin

In the first of a on AI in Hong Kong, Harvey Kong reports on the plight of young people worried about their future as firms use the tech for lower-level jobs and experts warn of a ‘broken talent chain’.

Trina Lau spent nearly three months looking for work after she was laid off from an e-commerce firm in Hong Kong in December.

It was the 23-year-old’s first job after graduating with a communications degree last year. The position only lasted for six months.

She sent out more than 50 job applications but only received calls for interviews for six of them.

Lau conceded that it was slow going because the economy was not picking up as quickly as she would have liked.

But now, she said, she had the added worry that her main competitor would be rapidly rising and evolving artificial intelligence (AI), which would make junior workers like her redundant.

“For instance, if I get a job in e-commerce, and suppose I rise to a senior position in two to three years, my job could be replaced by AI, and I will have to change industry,” she said.

Lau is among the tens of thousands of fresh graduates caught in a bind, analysts say, as they find themselves not fully immersed in the world of AI while jobs are being transformed by this new technology.

“Young people are bearing the brunt of the surge of AI as disruptions brought by the technology are coming quickly and suddenly,” said Wilson Wong Wai-ho, an associate professor at the Chinese University of Hong Kong (CUHK), who has studied how the technology impacts the future of work.

AI coming for junior jobs?

Official statistics show signs of AI already eating into job vacancies.

According to statistics from the Joint Institution Job Information System (JIJIS), a centralised online job information platform shared by the city’s eight publicly funded universities, last year marked a five-year low for the number of job vacancies posted, at 30,798, down by 51.5 per cent from 2021.

Some job categories with few openings were in industries heavily associated with the use of AI, such as information technology and programming, customer services, and administrative and clerical work.

Figures from the University Grants Committee showed 22,255 students completed an undergraduate degree in the 2024-25 academic year among the eight universities, compared with 22,333 in 2020-21, the year when the Covid-19 pandemic broke out.

In terms of the overall number of graduates, 2024-25 recorded 29,676, while 2020-21 had 28,861.

A check of the JIJIS figures found that among the 33 job categories, the number of vacancies for 23 of them had fallen to a six-year low.

The information technology and programming sector, which once offered the highest volume of jobs for graduates with 8,251 vacancies in 2020, saw demand plummet by 66.7 per cent to just 2,749 by last year.

Customer service sector jobs in retail, hotels and tourism fell by 54.3 per cent from 3,763 in 2020 to 1,720 vacancies in 2025, according to JIJIS.

AI apps are taking over. Dylan Kwan, Hong Kong software start-up Wati’s general manager for the Greater China region, said his business was providing AI services to more than 16,000 clients around the world.

The company helps businesses engage their customers on WhatsApp, with the start-up providing a range of AI services.

While the obvious victims of AI are data entry and bookkeeping, Kwan said customer support roles were also among those that would have to evolve, noting that his firm had seen customer support tickets resolved by AI increase from 10 per cent to nearly 30 per cent throughout 2025.

“Up to 60 per cent of the customer support tickets are actually resolved by our AI for some of our customers, so we can see that there are efficiency improvements,” Kwan said.

Wati itself has its own engineers based in mainland China. Kwan said the firm’s corporate headquarters in Hong Kong had some product staff and engineers.

A broken talent chain problem?

While graduates can shrug off disappearing customer service roles as jobs they were not aiming for anyway, the reality is that the entire younger generation is fearful of what disruptions AI can herald for their future careers.

A survey of 1,178 Hongkongers aged between 15 and 30 by the Chinese YMCA of Hong Kong between May and September last year found that 43 per cent of respondents said they would change their future choice of subjects or career path based on AI developments.

Among those 43 per cent of respondents, 68 per cent said their reason for making the switch was due to a fear that their original choice of occupations would be replaced by AI, while 40.7 per cent said the change would benefit them in an environment that had these tools, and 33.6 per cent said they had adjusted as they were interested in the technology.

Jessica Mo Pui-man, the organisation’s principal programme secretary, said the data reflected young people’s concerns, particularly their anxieties about whether their chosen careers would still exist as AI developed.

But on the bright side, some young people also showed a readiness to embrace the opportunities opened up by AI, she said.

“When we’re hearing about AI all the time, it is really hard for young people not to wonder ‘this occupation may exist today, but would it still exist in the future?’” she said.

John Mullally, managing director for Robert Walters Hong Kong, said that while the decrease in vacancies was largely due to wider uncertainties in the macroeconomic environment, it had also led to firms considering whether they could turn to AI to reduce their manpower costs.

“Where the people who are running these companies are getting kind of excited about artificial intelligence is in its opportunities to create cost efficiencies and eliminate certain roles,” he said.

“AI plays into the whole theme of we need to be very careful about investing significant amounts of money into junior staff when we don’t know what our revenues are going to look like in two to three years.”

Mullally added that young people graduating in recent years would be disproportionately affected by AI-driven changes in the job market, as they lacked the experience, skills and track record that their senior colleagues would have.

“For instance, if you’re looking at commercial or sales roles, you don’t have a network, you don’t have a track record, you don’t have experience that you could point to that a company would say ‘OK, this is worth buying in’,” he said.

CUHK’s Wong, who is from the institution’s governance and policy science school, also said the rise of AI was one of the factors to blame for the drop in vacancies, with firms hoping that the technology could boost their competitiveness and cut their costs.

But the academic said he believed that the bigger issue was how AI had upended the traditional ways that young people entered the workforce and made their way up if firms shunned them.

This could lead to what Wong described as a “broken talent chain”, leaving businesses without the right mix of young talent to sustain future operations.

But he was confident businesses, universities and the government would have no choice but to fix the issue as they became more aware of this emerging phenomenon.

This could include bridging courses for university students entering the workforce, more extensive internship programmes or even incentives for companies to hire young people and train them for future jobs, he said.

The alternative would be higher youth unemployment, he warned, which could create social issues.

“Businesses should discuss with the government and universities how to solve this issue. The sooner you talk about it, the sooner you come up with a solution,” Wong said.

“If not, new graduates this year will be affected, the ones next year will be affected. We do not want so many young people feeling frustrated before they step foot in the job market. The societal cost of this is very high.”

Universities and the private sector ought to be more engaged with each other, he said, to come up with the right courses or programmes to help young people attain the skills required in the modern workforce, with the government acting as a facilitator.

The latter’s role was critical, many said, in setting the direction for the entire workforce.

Agreeing that this talent gap was a looming problem, Gary Chin Sheung-yung, career consulting leader at Mercer Hong Kong, also cautioned firms against only using AI to slash entry-level and boost short-term efficiency.

“That would eventually create a missing-generation problem, so you don’t have the pipeline for the younger generation to grow into more experienced managers in the next five to 10 years,” he said.

The long-term business sustainability of companies would also be at risk, he said.

Chin urged firms to redesign entry-level positions, including hiring junior employees and actively figuring out how they could work with AI.

They should also plan properly for apprenticeships, job rotations and mentorship schemes to ensure companies still had access to young talent, rather than shunting them aside, he said.

“At the same time, businesses themselves have to actively work with educational institutions themselves, telling them what their future needs would be, what kind of skills need to be put into the curriculum, and what experience has to be in education,” Chin said.

But Ian Choy Jing-man, president of the Hong Kong Institute of Human Resource Management, said he was not too worried as he felt the rise of AI tools had yet to lead to member companies hiring fewer young people.

Employers actually had a greater incentive to hire young people to help improve their AI literacy, he argued.

“Hong Kong’s population make-up also increasingly consists of older people. We are a rapidly ageing city compared to other places around the world,” he said.

“So, if you are a company that wants to ensure your survival, there is no way that you would not hire young people.”

Choy disagreed that young people would be disproportionately affected by the rise of AI, saying instead it was anyone who refused to embrace the technology who would lose out.

“A new graduate could take two to three years to learn how their organisations do things and how they can do their work in their specific field,” he said.

“Now, this will be shortened because of AI. This process will be compressed from two to three years to several months.”

Due to AI, newly joined staff members could perform their duties at a level similar to that of someone who had worked at the company for two to three years, he added.

Mullally said that young professionals should not just deepen their knowledge but also try to get as much exposure to their chosen sectors by widening their base of contacts via networking.

“That is going to give you a better line of sight as to the direction of travel within your sector, within your industry, within your company,” he said.

“But also in the process of doing that, you are going to build skills, and you’re going to build a network, which doesn’t make you fully AI-proof, but it gives you a better chance versus somebody who doesn’t have one.”

Mercer’s Chin argued that young people could take this further by incorporating their soft skills into their AI usage, such as using this technology to solve business problems or reviewing the output of these tools.

In terms of AI literacy and utilisation, CUHK’s Wong said young people should not only strive to be familiar with these tools, but also understand how they could apply the technology to their chosen fields or careers.

“Whenever they join a new organisation, they can think about how they can transform their organisations using AI, as companies want to look for people who can be a sort of internal consultant for them, who are people who understand the sector and AI, so that they could teach these skills to them,” he said.

Wong added that this mindset could also be extended to educational institutions, noting that universities should take an interdisciplinary approach to the technology, instead of only limiting it to computer science or engineering departments.

Young people such as Trina Lau said they were doing their best to learn about and live with AI.

But they expressed fears that things were moving too fast, with newer tools emerging and overtaking their pace of learning.

Lau said she had now found a job in administrative work but remained uneasy about the breakneck development of AI.

“When compared with the speed at which I am learning, the speed of its improvement is moving even quicker, so what I end up learning could be done in vain,” she said.`,
      },
      {
        sourceType: "manual",
        sourceName: "SCMP",
        title: "Hong Kong’s bid to win in AI: where are the road map and the guardrails?",
        url: "https://www.scmp.com/news/hong-kong/hong-kong-economy/article/3346561/hong-kongs-bid-win-ai-where-are-road-map-and-guardrails",
        externalId: "scmp-3346561",
        author: "Oscar Liu",
        publishedAt: new Date("2026-03-16"),
        rawText: `Hong Kong’s AI revolution accelerates as policy funds skills training while industries and educators rush to integrate the shift

In the second of a on AI in Hong Kong, Oscar Liu reports on how society, from government and companies to institutions and individuals, is scrambling to embrace AI, as work itself gets redefined.

Keith Li King-wah’s business once thrived during the 2010s. In a crowded field of more than 100 rivals, his programming consultancy, Innopage, easily secured contracts worth hundreds of thousands of Hong Kong dollars to develop basic digital tools, such as a mortgage calculator, for corporations and government agencies.

But those easy-money days are gone. The rapid rise of generative artificial intelligence (AI) has transformed high-value coding into widely accessible and automated services, leaving Li’s award-winning 20-person venture obsolete.

“Since the emergence of ChatGPT in 2023, the industry has shrunk to the point where players can be counted on two hands. The programming ecosystem has been hit the hardest,” Li said.

Li is among a wave of industry leaders scrambling to outpace the new technology long before the government pivoted towards an “AI for all” initiative, alongside a massive overhaul of school curricula and vocational retraining.

In his recent budget address, Financial Secretary Paul Chan Mo-po announced a comprehensive strategy called AI+ to popularise the technology and enhance digital literacy across all levels of society.

As part of this initiative, HK$50 million (US$6.4 million) will be allocated to build public awareness and skills through AI courses, seminars and competitions focused on responsible use.

To support the current workforce, the Employees Retraining Board will be rebranded as “Upskill Hong Kong”, focusing on providing skills-based AI training to enhance local competitiveness.

For Li, these initiatives could not come soon enough. He highlighted a radical shift in the professional services landscape brought about by AI, where a single person can now use the technology to handle an entire programming process.

“They can even use other AI tools to test what someone else has created. A week of intensive human labour is now condensed into a single day,” he said.

Finding that he could not beat the technology, Li decided to join hands with it. He rebranded himself as an educator and corporate trainer, focusing on AI literacy for executives and students at the Productivity Council.

Now mostly teaching how to use OpenAI’s ChatGPT and DALL-E for generating high-fidelity images for business use from text prompts, Li identified the lack of qualified educators as the most critical barrier to AI development in the city.

“Large financial injections alone cannot fix the issue if the human infrastructure is absent. We want to train the trainer, but the master trainer is nowhere to be found because this thing is too new,” Li said.

The fevered rush in education

The education sector is set for significant transformation, with universities slated to introduce 27 undergraduate programmes by the 2027–28 academic year and the Vocational Training Council implementing compulsory AI modules across its higher diploma courses.

Meanwhile, HK$2 billion from the Quality Education Fund has been earmarked for primary and secondary schools to fund AI education programmes and teacher training.

Li added that teachers were too overwhelmed by administrative burdens to learn and implement new technologies.

“The problem is that if the people in the school do not know how to teach, the students will not be learning either,” he said.

Pascal Siu Yat-kui, senior research manager of think tank Our Hong Kong Foundation, said that while the government showed it had serious AI ambitions, there was a critical need for a clearer definition of what “AI for all” meant in practice.

“At the school level, an AI literacy framework essentially does not exist. Without a standardised curriculum, schools risk over-teaching certain topics or under-teaching others,” Siu said.

“Hong Kong should look to other regions that utilise school-specific governance frameworks to provide structured guidance, such as teaching by age or subject, to ensure consistency across the education system.”

Lin Chun-pong, chairman of the Hong Kong Association of the Heads of Secondary Schools, said the city’s AI roll-out had to transform educators from simple users into practitioners who integrated the technology into specific subjects.

He noted that while pupils should learn at an age-appropriate level, AI should eventually be embedded across various disciplines once they had reached competency.

Lin called for a comprehensive citywide AI strategy to guide both the education sector and society.

“We teachers are not experts in AI. If we want our students to be able to learn systematically and in a good way, we need to think about how we can have some AI laboratories,” he said.

Embracing the government’s strategy, the Jockey Club Charities Trust has committed HK$255 million to partner with the Chinese University of Hong Kong on a project that provides AI literacy and curriculum support for upper primary and junior secondary pupils.

Professor Cao Jiannong, vice-president (education) of Polytechnic University, said AI curricula must be highly tailored rather than follow a “one-size-fits-all” approach. He advocated a “train-the-trainer” model, under which departments would nominate professors for advanced training.

“These educators already understand AI applications within their disciplines; they can quickly master new tools and return to their respective fields to train colleagues, ensuring effective AI integration across the university,” he said.

He noted that mainland China remained at the forefront of AI in education after a decade of strong government promotion, with many universities there having developed mature curricula that Hong Kong could learn from.

“When advancing AI education, sharing teaching materials across institutions can help avoid repetitive development. By learning from established models and adapting them to Hong Kong’s unique needs, the city can draw on all its strengths to achieve better results,” Cao added.

Government gets on board but obstacles remain

The vice-president also described the current efforts of the government as “merely just the beginning”, as he noted a lack of a unified strategy for the public.

“There must be a clear direction and goal regarding what kind of important ‘high ground’ for AI Hong Kong should become,” he said.

“For instance, could AI transform Hong Kong from just a smart city into an AI city? It requires directional guidance. Only then will universal AI learning for the general public become truly effective.”

Cao also warned that the financial burden of sustained adoption, including computing power and model training, also needed attention. In short, it cannot be a one-off allocation.

“Comprehensive follow-up support and resources will be crucial for sustainable development,” he said.

Engineering sector lawmaker Aaron Bok Kwok-ming, who served as a council member of the Hong Kong Senior Government Officers Association, noted that fragmented implementation across departments had left frontline staff without unified training.

He added that a shortage of professional mentors and technical support had left many civil servants, especially those in professional grades, relying on self-learning to bridge the skills gap.

“I believe the Civil Service College should take the lead in providing unified training. But the key lies in practical implementation; we cannot have a ‘one-size-fits-all’ curriculum. We need down-to-earth, practical courses tailored to the needs of different roles,” Bok said.

“AI training is a strategic investment, not a discretionary expense that can be cut.”

He also said the government funding must be centrally coordinated and earmarked for specific purposes to ensure frontline staff truly benefited.

Ronald Pong, a cybersecurity expert who also chairs the Smart City Consortium’s IT governance committee, said while the push for AI adoption was positive, Hong Kong risked “mass-producing vulnerabilities” rather than talent without robust governance.

“There’s a critical need for safety standards. Simply teaching tool adoption is insufficient without establishing an information security baseline. Using AI responsibly is not a hollow slogan but a shield against systemic vulnerabilities that could be exploited for mass misinformation,” he said.

He also questioned whether the Employees Retraining Board, which focuses on short-term vocational training, had the necessary academic depth and specialised competence to provide AI education.

“We cannot just focus on the ‘how-to-use’ without involving auditors, legal experts and law enforcement in a cross-disciplinary regulatory net,” he said. “AI training is about ensuring every discipline understands the specific security risks inherent to their field.”

Pong also highlighted what he described as a looming crisis within the legal system, where the rapid iteration of deepfake AI-generated content could soon overwhelm the judiciary.

“The time and financial cost of having expert witnesses and the courts verify such evidence could cause the system to collapse,” he cautioned.

He added that cross-border data storage in the Greater Bay Area remained a legal minefield. Despite existing “white lists” for data flow, improper or unintentional storage via cloud services could trigger severe legal consequences or implicate national security laws.

“If we encourage mass adoption without clarifying these jurisdictional boundaries, we will invite a massive wave of information leakage and legal liability,” he said.

Based on these concerns, it would appear the new committee on AI+ would have its work cut out for it. The finance chief will chair the Committee on AI+ and Industry Development Strategy to drive the transformation.

Siu said he expected the committee, comprising experts and academics, to develop a vital governance framework.

“The government itself needs to establish a central guidance on how it will utilise AI, which in turn teaches various bureaus or departments how to implement it. It should take a leading role to advise some sectors on how to set up their own governance frameworks,” he said.

“The hope is for a top-level approach rather than having fragmented standards across society.”

He proposed an accountable, risk-based governance model that adjusts requirements according to the severity of AI use, distinguishing between “lower-risk” tasks such as translation or document summarisation and “high-risk” scenarios affecting education, healthcare, or vulnerable groups.

“If everyone just shifts the blame onto AI, it can lead to governance problems down the road,” he said.

Industries lead the way with AI

While the government is navigating how to popularise the application of AI in society, different industries have made their own moves to embrace the new technology.

Albert So Man-kit, a senior partner and practising lawyer at AC Lawyers, for example, has spent years developing AI tools that use the firm’s subscribed databases to handle tasks once delegated to a junior lawyer.

For him, the integration of AI has directly eliminated about 40 per cent of the manual, repetitive workload traditionally required in legal services.

“Previously, drafting a contract meant starting from scratch or using a template. Now we use our AI tool by inputting keywords, such as asset distribution or employment terms, and the system produces a legally sound draft in seconds before vetting,” he said.

The lawyer said such tasks were particularly gruelling during high-volume periods like the 2008 financial crisis when he handled more than 30,000 disputes.

But he stressed that law firms were not necessarily reducing their headcount despite the efficiency gains as the time saved by AI allowed them to handle more complex cases.

The heavy industry sector is also incorporating AI in its internal systems. Gammon Construction, for example, has implemented an AI governance framework with its proprietary tool, “GamBot”, which has achieved a 70 per cent usage rate within the 3,000-strong company.

Developed as a secure, in-house model built on the ChatGPT 4.0 architecture, the tool allows staff to streamline complex tasks without compromising data integrity, according to the firm’s executive director, Ian Choy Jing-man.

“It helps us, for example, retrieve data or blueprints from past projects; you simply enter the project name and all information pops up. This saves us a significant amount of time and assists in consolidating information,” he said.

While firms are making such efforts, it is clear that workers must also equip themselves with the right AI skills. According to Microsoft’s 2025 Annual Work Trend Index, which draws on a global survey of 31,000 workers and LinkedIn labour trends, AI proficiency has become a non-negotiable asset.

The research found that 76 per cent of Hong Kong leaders expected to use “digital labour” to expand their workforce, while 83 per cent believed AI would enable employees to take on strategic work much earlier in their careers.

Eason Lai, a global technology strategist at Microsoft in Hong Kong, noted that the technology had rapidly matured into a core professional requirement across all major industries, including retail and customer service.

He observed that AI had become an essential pillar across industries, with the shift moving beyond simple “chatting” with a bot into a new era of working with autonomous “AI agents”.

An AI agent is a system that takes a prompt and turns it into a series of independent actions.

Lai, who works with many of the city’s conglomerates, explained that while the first wave of AI was epitomised by a “digital librarian” waiting for questions, the new agent is a “digital employee” working autonomously towards a goal, such as identifying target customers, without constant human prompts.

“We are building ‘early-stage agents’ for a retail giant that automatically filter databases, identify customer trends like birthday months or purchasing habits, and generate entire promotion campaigns without manual intervention,” Lai said.

“The fear comes when they realise that within a few months, these technologies will be so mature that they may not even need a human to ‘approve’ the work any more. That is when they start to worry.

“While we haven’t seen massive lay-offs yet, the ‘existence value’ of certain roles is being questioned.”`,
      },
    ],
  });

  console.log("✅ Seed completed");
}

main()
  .then(async () => {
    await prisma.$disconnect();

    process.exit(0);
  })
  .catch(async (error) => {
    console.error("❌ Seed failed:", error);

    await prisma.$disconnect();

    process.exit(1);
  });
