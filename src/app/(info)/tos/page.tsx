import CollapsibleScroll from '@/components/animated/CollapsibleScroll'
import Separator from '@/components/common/scroll/Separator'
import React from 'react'

type RuleBlock = {
	id: string
	title: string
	vie: React.ReactNode
	eng: React.ReactNode
}

const blocks: RuleBlock[] = [
	{
		id: 'attendee-tickets',
		title: 'VÉ THAM GIA / ATTENDEE TICKETS',
		vie: (
			<ul className='list-disc list-inside space-y-1.5'>
				<li>
					Người tham gia bắt buộc phải đeo thẻ tên nhận diện trong suốt thời
					gian ở khu vực sự kiện.
				</li>
				<li>
					Thẻ tên phải được đeo ở vị trí dễ nhìn thấy (ngực, cổ hoặc tay áo).
				</li>
				<li>
					Vé và thẻ tên là tài sản của ban tổ chức, không được chuyển nhượng,
					cho mượn hoặc sao chép khi chưa có sự đồng ý của BTC.
				</li>
				<li>Người tham gia có trách nhiệm bảo quản thẻ tên.</li>
			</ul>
		),
		eng: (
			<ul className='list-disc list-inside space-y-1.5'>
				<li>
					All attendees must wear their identification badges at all times while
					in the event area.
				</li>
				<li>
					Badges must be displayed in a visible location (chest, neck, or
					sleeve).
				</li>
				<li>
					Tickets and badges are the property of the organizing committee and
					may not be transferred, lent, or duplicated without the consent of the
					organizing committee.
				</li>
				<li>Attendees are responsible for safeguarding their badges.</li>
			</ul>
		),
	},
	{
		id: 'attendee-conduct',
		title: 'CÁCH HÀNH XỬ / PERSONAL CONDUCT',
		vie: (
			<ul className='list-disc list-inside space-y-1.5'>
				<li>
					Cấm mọi hành vi bạo lực, đe dọa hoặc gây nguy hiểm đến tính mạng, sức
					khỏe, tài sản của người khác.
				</li>
				<li>
					Cấm mọi hành vi quấy rối, đeo bám, theo dõi hoặc gây phiền nhiễu cho
					người khác.
				</li>
				<li>
					Nghiêm cấm các hành vi mang tính chất gợi cảm, hành vi gợi ý tình dục
					và bất kỳ sự tiếp xúc thân thể nào khi chưa có sự đồng ý.
				</li>
				<li>
					Cấm mọi hành vi kỳ thị, phân biệt đối xử, xúc phạm danh dự, nhân phẩm
					hoặc gây chia rẽ cộng đồng.
				</li>
				<li>
					Cấm các hành vi tuyên truyền, kích động liên quan đến tôn giáo, chính
					trị hoặc mang tính chất quân sự.
				</li>
				<li>
					Vui lòng không thực hiện các hành vi gây mất trật tự hoặc ảnh hưởng
					tiêu cực đến người tham dự, nhân viên, hoặc hoạt động chung của tòa
					nhà.
				</li>
			</ul>
		),
		eng: (
			<ul className='list-disc list-inside space-y-1.5'>
				<li>
					Prohibited acts of violence, threats, or endangerment to the life,
					health, or property of others.
				</li>
				<li>
					Prohibited acts of harassment, stalking, following, or causing
					disturbance to others.
				</li>
				<li>
					Prohibited acts of sexual nature, sexually suggestive behavior, and
					any physical contact without consent.
				</li>
				<li>
					Prohibited acts of discrimination, prejudice, defamation, or actions
					that cause division within the community.
				</li>
				<li>
					Prohibited acts of propagating or inciting content related to
					religion, politics, or of a military nature.
				</li>
				<li>
					Prohibited acts that disrupt order or negatively affect attendees,
					staff, or general building operations.
				</li>
			</ul>
		),
	},
	{
		id: 'attendee-prohibited-items',
		title: 'NHỮNG VẬT PHẨM BỊ CẤM / PROHIBITED ITEMS',
		vie: (
			<ul className='list-disc list-inside space-y-1.5'>
				<li>
					Cấm những vật phẩm có khả năng gây sát thương, cháy nổ và các vật phẩm
					có hình dạng vũ khí.
				</li>
				<li>
					Cấm những vật phẩm có nội dung không phù hợp, 18+ và liên quan đến
					chính trị, tôn giáo.
				</li>
				<li>
					Cấm rượu bia, thuốc lá và tất cả các chất kích thích trong khu vực sự
					kiện.
				</li>
				<li>Không được mang đồ ăn vào khuôn viên bên trong sự kiện.</li>
				<li>
					Tránh mang theo các vật có mùi nồng, gây tiếng ồn lớn hoặc ánh đèn
					chớp sáng gây khó chịu.
				</li>
				<li>
					Tránh mang theo các vật cồng kềnh chiếm nhiều chỗ hoặc gây cản trở lối
					đi.
				</li>
			</ul>
		),
		eng: (
			<ul className='list-disc list-inside space-y-1.5'>
				<li>
					No items that can cause bodily harm, explosives, or items resembling
					weapons.
				</li>
				<li>
					No pornographic publications, sensitive or inappropriate content, 16+
					or related to politics and religions.
				</li>
				<li>No alcohol, cigarettes, and all stimulants inside the venue.</li>
				<li>
					Avoid heavy smelling items, loud noises or bright flashing lights
					causing discomfort for others.
				</li>
				<li>Avoid big bulky items taking up space or causing blockades.</li>
			</ul>
		),
	},
	{
		id: 'attendee-clothing',
		title: 'TRANG PHỤC VÀ PHỤ KIỆN / CLOTHING AND ACCESSORIES',
		vie: (
			<div className='space-y-2'>
				<p>
					Sự kiện có người tham gia trong độ tuổi 16+; trang phục cần phù hợp
					với không gian công cộng.
				</p>
				<p>
					Người tham dự phải ăn mặc có chuẩn mực tại sự kiện. Những trang phục
					và phụ kiện bị cấm bao gồm:
				</p>
				<ul className='list-disc list-inside space-y-1.5'>
					<li>Trang phục hở hang, gợi cảm</li>
					<li>Liên quan đến chính trị, tôn giáo hay quân sự</li>
					<li>
						Trang phục, đạo cụ có hình dạng vũ khí hoặc có khả năng gây thương
						tích
					</li>
					<li>Trang phục quá khổ gây cản trở đi lại</li>
				</ul>
				<p>
					Trong trường hợp người tham gia mặc hở hang hoặc nhạy cảm, ban tổ chức
					có quyền yêu cầu bạn thay đổi thay phục trang.
				</p>
				<p>
					Nếu không tuân thủ quy định, ban tổ chức có quyền yêu cầu bạn rời khỏi
					khu vực sự kiện.
				</p>
				<p>
					Quyết định cuối cùng về tính phù hợp của trang phục thuộc về Ban Tổ
					chức.
				</p>
				<p>
					Trang phục phù hợp là trang phục dễ chịu, thoải mái với người sử dụng,
					đảm bảo với tính chất công cộng và cộng đồng của sự kiện, đảm bảo tính
					lịch sự và không có hình ảnh, biểu tượng hoặc ngôn từ phản cảm, kích
					động bạo lực, phân biệt đối xử hoặc trái với thuần phong mỹ tục. Đồng
					thời, trang phục không được gây cản trở hoạt động sự kiện hoặc ảnh
					hưởng đến an toàn, trật tự chung.
				</p>
			</div>
		),
		eng: (
			<div className='space-y-2'>
				<p>
					The event is attended by participants of various age groups; attire
					must be appropriate for a public setting.
				</p>
				<p>
					Attendees must be dressed appropriately at the event. Prohibited
					costumes and accessories include:
				</p>
				<ul className='list-disc list-inside space-y-1.5'>
					<li>Revealing, suggestive clothing</li>
					<li>
						Political, religious or military, intended for propaganda,
						incitement of hostility, or causing division
					</li>
					<li>Weapon-shaped or able to cause harm</li>
					<li>
						Oversized costume making it difficult for other guests to move
					</li>
				</ul>
				<p>
					Should the attendees dress too suggestively or revealing, organizers
					will ask you to change your costumes or cover yourself up.
				</p>
				<p>
					Organizers has the right to ask you to leave the venue if you do not
					cooperate.
				</p>
				<p>
					The final decision regarding the appropriateness of attire rests with
					the Organizing Committee.
				</p>
				<p>
					Appropriate attire is clothing that is comfortable and convenient for
					the wearer, suitable for the public and community nature of the event,
					maintaining decency and must not display offensive images, symbols, or
					text that incite violence, are discriminatory, or contrary to public
					morals. Additionally, attire must not obstruct event activities or
					compromise safety and public order.
				</p>
			</div>
		),
	},
	{
		id: 'attendee-photography',
		title: 'QUAY PHIM VÀ CHỤP ẢNH / VIDEOGRAPHY AND PHOTOGRAPHY',
		vie: (
			<div className='space-y-2'>
				<p>
					Người tham gia có thể quay chụp tại sự kiện và sử dụng cho mục đích cá
					nhân. Nhưng ban tổ chức có quyền yêu cầu bạn gỡ bỏ nếu bài đăng có
					chứa hình ảnh không phù hợp gây ảnh hưởng đến sự kiện hay những người
					tham gia khác.
				</p>
				<p>
					Mọi người đều phải hành xử đúng chừng mực khi quay chụp tại sự kiện và
					phải tôn trọng khi quay chụp những người tham gia khác. Nếu ai đó
					không thoải mái khi quay chụp, bạn cần tôn trọng quyết định của họ.
				</p>
				<p>
					Người tham gia phải tuân theo hướng dẫn của BTC/Bảo an khi BTC yêu cầu
					dừng hoặc ngừng mọi hoạt động chụp/quay tại những khu vực hoặc thời
					điểm nhất định. Tuyệt đối cấm quay/chụp/ghi âm tại nhà vệ sinh, khu
					thay đồ, khu vực thay trang phục kín, và các khu vực nhạy cảm khác.
				</p>
				<p>
					Nghiêm cấm chỉnh sửa, thay đổi bằng các công cụ chỉnh sửa, AI hoặc
					đăng tải, lan truyền các thông tin, sản phẩm đã thông qua các công cụ
					chỉnh sửa, AI nhằm mục đích bôi nhọ, công kích hoặc gây ảnh hưởng tiêu
					cực tới người tham gia hoặc sự kiện.
				</p>
			</div>
		),
		eng: (
			<div className='space-y-2'>
				<p>
					Attendees may record the event for personal use. However, organizers
					may still ask you to take the post down if it contains images
					affecting the event or other attendees.
				</p>
				<p>
					Attendees must act accordingly when recording at the event. Respect
					other attendees’ personal space and do not record them if they’re not
					comfortable with it.
				</p>
				<p>
					Participants must comply with instructions from the Organizing Team
					and/or Security staff when they request all photography, filming, or
					recording activities to stop or cease in specific areas or at certain
					times. Photography, videography, and audio recording are strictly
					prohibited in restrooms, changing rooms, private dressing areas, and
					other sensitive locations.
				</p>
				<p>
					Attendees acknowledges that being accidentally recorded is
					unavoidable.
				</p>
				<p>
					Organizers reserve the rights to use videos/images containing
					attendees for marketing purposes.
				</p>
				<p>
					The use of editing tools, AI, or any form of modification to alter
					images, videos, or audio - as well as the posting or distribution of
					content created or modified using such tools - for the purpose of
					defamation, harassment, or causing negative impact to participants or
					the event is strictly prohibited.
				</p>
			</div>
		),
	},
	{
		id: 'attendee-organizer-decision',
		title: 'QUYẾT ĐỊNH CỦA BAN TỔ CHỨC / ORGANIZER’S DECISION',
		vie: (
			<ul className='list-disc list-inside space-y-1.5'>
				<li>
					Ban tổ chức có quyền nhắc nhở, cảnh cáo người vi phạm quy định lần đầu
					tiên. Khi vi phạm, người tham gia phải nghe theo hướng dẫn xử lý của
					BTC và có quyền phản hồi lập tức tại nơi xảy ra vi phạm nếu thấy chưa
					thỏa đáng.
				</li>
				<li>
					Đối với vật phẩm vi phạm quy định, ban tổ chức có quyền yêu cầu người
					tham gia gửi vật phẩm bên ngoài khu vực sự kiện hoặc tạm giữ cho đến
					khi kết thúc sự kiện.
				</li>
				<li>
					Người vi phạm tái phạm sau khi đã được nhắc nhở hoặc vi phạm nghiêm
					trọng sẽ bị yêu cầu rời khỏi khu vực sự kiện, thu hồi thẻ tên và không
					được hoàn lại chi phí tham gia.
				</li>
				<li>
					Hành vi vi phạm nghiêm trọng hoặc tái phạm nhiều lần sẽ được ghi nhận
					và ảnh hưởng đến khả năng tham gia các sự kiện FUVE trong tương lai.
				</li>
				<li>
					Ban tổ chức có quyền xử lý các hành vi hoặc vật phẩm không được liệt
					kê cụ thể nhưng gây ảnh hưởng tiêu cực đến sự kiện, người tham dự hoặc
					trái với tinh thần của quy định này.
				</li>
				<li>
					Mọi người có trách nhiệm báo cáo ngay cho ban tổ chức khi phát hiện
					hành vi vi phạm quy định để đảm bảo quyền lợi của mình.
				</li>
			</ul>
		),
		eng: (
			<ul className='list-disc list-inside space-y-1.5'>
				<li>
					The organizing committee reserves the right to issue warnings and
					cautions to first-time offenders. Upon violation, attendees must
					comply with the organizing committee’s directives and have the right
					to provide immediate feedback at the location of the violation if they
					find the decision unsatisfactory.
				</li>
				<li>
					For prohibited items, the organizing committee may require attendees
					to store items outside the event area or temporarily hold them until
					the event concludes.
				</li>
				<li>
					Repeat offenders after receiving warnings or those committing serious
					violations will be required to leave the event premises, have their
					badges revoked, and forfeit participation fees.
				</li>
				<li>
					Serious violations or repeated offenses will be documented and may
					affect eligibility to attend future FUVE events.
				</li>
				<li>
					The organizing committee reserves the right to address behaviors or
					items not explicitly listed that negatively impact the event,
					attendees, or violate the spirit of these regulations.
				</li>
				<li>
					All individuals are responsible for promptly reporting any violations
					to the organizing committee.
				</li>
			</ul>
		),
	},
	{
		id: 'dealer-product-regulations',
		title: 'QUY ĐỊNH VỀ MẶT HÀNG / PRODUCT REGULATIONS',
		vie: (
			<div className='space-y-2'>
				<p>
					Người bán hàng phải chuẩn bị danh sách kê khai về các mặt hàng kinh
					doanh trong sự kiện.
				</p>
				<p>Các sản phẩm kinh doanh phải tuân thủ theo các tiêu chí sau:</p>
				<ul className='list-disc list-inside space-y-1.5'>
					<li>Sản phẩm tự tay làm ra</li>
					<li>Sản phẩm bán lại đã có sự cho phép của tác giả</li>
					<li>
						Sản phẩm có tối thiểu 25% sự đóng góp của người bán hàng trong quá
						trình làm nên sản phẩm
					</li>
				</ul>
				<p>Các sản phẩm bị cấm kinh doanh tại sự kiện:</p>
				<ul className='list-disc list-inside space-y-1.5'>
					<li>Các sản phẩm nhạy cảm, 16+</li>
					<li>Đồ ăn, thức uống</li>
					<li>Các vật dụng có thể gây thương tích</li>
					<li>Rượu bia và các chất kích thích</li>
					<li>Các sản phẩm gây cháy, nổ</li>
				</ul>
				<p>
					Cấm các hành vi sử dụng vật dụng, chất gây cháy nổ tại khu vực sự kiện
					và khu vực bán hàng. Hạn chế đặt các vật dụng có khả năng gây và lây
					lan cháy (ly giấy, khăn giấy, vải khô, …) gần các khu vực điện có thể
					tiếp xúc và dây điện.
				</p>
				<p>Các sản phẩm vi phạm quy định sẽ bị tịch thu bởi Ban tổ chức.</p>
				<p>
					Các gian hàng vi phạm quy định lần đầu sẽ bị nhắc nhở bởi Ban tổ chức,
					lần vi phạm thứ hai sẽ bị yêu cầu dừng mọi hoạt động liên quan bởi Ban
					tổ chức.
				</p>
				<p>
					Ban tổ chức không chịu trách nhiệm về mọi tổn thất về vật chất trong
					và ngoài sự kiện.
				</p>
			</div>
		),
		eng: (
			<div className='space-y-2'>
				<p>
					Dealers must prepare a product list of products for sale during the
					event.
				</p>
				<p>Listed products must satisfy the following conditions:</p>
				<ul className='list-disc list-inside space-y-1.5'>
					<li>Handmade</li>
					<li>Reselling products are proved allowed by the makers/artists</li>
					<li>
						Products must have a minimum of 25% of the Dealers/Sellers
						participation during the product developing process.
					</li>
				</ul>
				<p>Prohibited products at the event:</p>
				<ul className='list-disc list-inside space-y-1.5'>
					<li>Sensitive products, 16+</li>
					<li>Food, beverage</li>
					<li>Sharp objects</li>
					<li>Alcohols and stimulants</li>
					<li>Flammable products</li>
				</ul>
				<p>
					All acts of using stimulants, flammable items at the event and booth
					areas are prohibited. Avoid placing flammable objects (paper cups, dry
					towels, papers, …) near open electric sockets and wires.
				</p>
				<p>All violated products will be revoked by the Organizers.</p>
				<p>
					Booths violating the regulations once will be warned by the
					Organizers, the second violation will result in force to stop all
					booth related activities by the Organizers.
				</p>
				<p>
					The Organizer is not responsible for any losses inside and outside of
					the event.
				</p>
			</div>
		),
	},
	{
		id: 'dealer-area',
		title: 'VỀ KHU VỰC BÁN HÀNG / DEALER DEN AREA',
		vie: (
			<ul className='list-disc list-inside space-y-1.5'>
				<li>
					Người bán hàng phải đến nhận vé và bàn đúng theo giờ quy định được đề
					ra.
				</li>
				<li>
					Cấm các hành vi xâm lấn không gian của Người bán hàng khác, bao gồm
					vật tư, con người và bày trí.
				</li>
				<li>
					Hạn chế trang trí khu vực bán hàng liên quan đến các chủ đề nhạy cảm,
					tôn giáo.
				</li>
				<li>
					Người bán hàng có trách nhiệm giữ gìn vệ sinh sạch sẽ khu vực bán hàng
					của mình.
				</li>
				<li>
					Giữ gìn tài sản tư, tài sản chung của tòa nhà và của Ban tổ chức sự
					kiện.
				</li>
				<li>
					Người bán hàng chịu trách nhiệm về việc quản lý khách hàng của mình,
					tránh gây ảnh hưởng tới lối đi chung và các gian hàng khác.
				</li>
			</ul>
		),
		eng: (
			<ul className='list-disc list-inside space-y-1.5'>
				<li>
					Dealers must arrive and receive their ticket and booth on informed
					time.
				</li>
				<li>
					All behaviours of violating other booth’s area are prohibited,
					including decorations, personnel and customer lines.
				</li>
				<li>
					Avoid decorating your booth with decorations associated with sensitive
					topics, religions.
				</li>
				<li>All Dealers must keep their booth clean and well-organized.</li>
				<li>
					Keep an eye out for your personal belongings, Building’s and
					Organizer’s properties.
				</li>
				<li>
					Dealers/Sellers are responsible for handling customer queues, avoiding
					affecting common walkways and other booths.
				</li>
			</ul>
		),
	},
	{
		id: 'dealer-organizer-decision',
		title: 'QUYẾT ĐỊNH CỦA BAN TỔ CHỨC / ORGANIZER’S DECISION',
		vie: (
			<ul className='list-disc list-inside space-y-1.5'>
				<li>
					Ban tổ chức có toàn quyền yêu cầu Người bán hàng dừng mọi hoạt động
					liên quan tới quầy và rời khỏi khu vực sự kiện nếu vi phạm quy định
					được đề ra.
				</li>
				<li>
					Ban tổ chức có toàn quyền quyết định vị trí gian hàng của người bán
					hàng.
				</li>
			</ul>
		),
		eng: (
			<ul className='list-disc list-inside space-y-1.5'>
				<li>
					The Organizer has all the rights to require the Dealers to stop all
					activities related to the booth and leave the event area if the dealer
					violated the regulations.
				</li>
				<li>
					The Organizer has all the rights to decide the Dealer’s booth
					location.
				</li>
			</ul>
		),
	},
]

const TosPage = (): React.ReactElement => {
	return (
		<div className='min-h-screen relative z-10 py-12 px-4 sm:px-10 md:px-20'>
			<CollapsibleScroll
				initialOpen
				openable={false}
				className='lg:w-5xl mx-auto  md:w-3xl'
			>
				<div className='pt-2'>
					<h3 className="scroll-title pt-6 josefin bg-[url('/textures/asfalt-dark.png')] bg-primary bg-clip-text text-transparent">
						QUY TẮC CỦA SỰ KIỆN / EVENT RULE
					</h3>
					<p className='text-text-secondary text-sm mt-1'>
						Last updated: April 2, 2026
					</p>
				</div>

				<Separator className='w-[95%] mx-auto' />

				<div className='text-text-primary text-md font-sm space-y-6'>
					<div className='space-y-2'>
						<p>
							<strong>[VIE]</strong> Để đảm bảo mang lại trải nghiệm tốt nhất
							cho tất cả người tham gia, FUVE có những quy tắc ứng xử dành cho
							tất cả mọi người. Khi tham gia sự kiện bạn bắt buộc phải tuân thủ
							quy tắc của sự kiện.
						</p>
						<p>
							<strong>[ENG]</strong> To ensure the best experience for all
							participants, FUVE has a code of conduct for everyone. When
							participating in the event, you are required to comply with the
							event rules.
						</p>
					</div>

					<div id='rule-attendee' className='space-y-2'>
						<p className='font-bold'>
							QUY ĐỊNH DÀNH CHO NGƯỜI THAM GIA / RULE FOR ATTENDEE
						</p>
					</div>

					{blocks.slice(0, 7).map(block => (
						<section
							key={block.id}
							id={block.id}
							className='space-y-2 scroll-mt-24'
						>
							<p className='font-bold'>{block.title}</p>
							<div className='space-y-2'>
								<p className='text-xs uppercase tracking-[0.2em] text-text-secondary'>
									[VIE]
								</p>
								<div className='space-y-1'>{block.vie}</div>
							</div>
							<div className='space-y-2'>
								<p className='text-xs uppercase tracking-[0.2em] text-text-secondary'>
									[ENG]
								</p>
								<div className='space-y-1'>{block.eng}</div>
							</div>
						</section>
					))}

					<div id='rule-dealer' className='space-y-2 pt-2'>
						<p className='font-bold'>
							QUY ĐỊNH DÀNH CHO NGƯỜI BÁN HÀNG / RULE FOR DEALER
						</p>
					</div>

					{blocks.slice(7).map(block => (
						<section
							key={block.id}
							id={block.id}
							className='space-y-2 scroll-mt-24'
						>
							<p className='font-bold'>{block.title}</p>
							<div className='space-y-2'>
								<p className='text-xs uppercase tracking-[0.2em] text-text-secondary'>
									[VIE]
								</p>
								<div className='space-y-1'>{block.vie}</div>
							</div>
							<div className='space-y-2'>
								<p className='text-xs uppercase tracking-[0.2em] text-text-secondary'>
									[ENG]
								</p>
								<div className='space-y-1'>{block.eng}</div>
							</div>
						</section>
					))}
				</div>

				<div className='pb-5' />
			</CollapsibleScroll>
		</div>
	)
}

export default TosPage
