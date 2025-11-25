import CollapsibleScroll from '@/components/animated/CollapsibleScroll'
import Separator from '@/components/common/scroll/Separator'
import React from 'react'

const ArtBookRulesSection = () => {
	const rules: string[] = [
		'Một gian hàng sẽ có một người đứng tên, gọi là "Dealer".',
		'Gian hàng có thể được đăng kí thêm người để hỗ trợ bán, tạm gọi là "Dealer Staff".',
		'Lưu ý:',
		'Gian hàng được tính là 1 loại vé nên người đăng kí gian hàng (cả Dealer và Dealer Staff) không cần mua vé tham gia nữa.',
		'Dealer sẽ là người đăng kí vé cho cả bản thân và Dealer Staff của mình.',
		'QUY ĐỊNH CỦA GIAN HÀNG',
		'Không bán các ấn phẩm không phù hợp với thuần phong mỹ tục. Không bán đồ R16 trở lên.',
		'Không bán vũ khí, đồ vật có thể gây sát thương, hoặc các mặt hàng bị pháp luật cấm/hạn chế.',
		'Các bạn được tự do trang trí gian hàng của mình.',
		'Không bán đồ ăn thức uống.',
		'BTC chỉ hỗ trợ bàn ghế và vị trí cho quầy hàng; những vật dụng khác như khăn trải bàn, khung lưới treo đồ... các bạn tự chuẩn bị.',
		'LƯU Ý',
		'Mỗi gian hàng sẽ có một người đại diện chính (Dealer).',
		'Mỗi gian hàng được đăng ký thêm tối đa 2 Dealer Staff.',
		'Dealer chịu trách nhiệm đăng ký vé cho cả bản thân và Dealer Staff.',
		'Mỗi gian hàng bao gồm 1 bàn (150cm x 50cm) và 2 ghế. Có thể ghép thêm 1 bàn (tối đa 2 bàn/gian).',
		'Vé Dealer và Dealer Staff là loại vé Star cố định: 550.000 VND. Không thể up rank, nhưng có thể ghi yêu cầu riêng trong form.',
		'Cả Dealer và Dealer Staff nhận đủ quyền lợi của vé Star (hoặc vé up rank nếu có).',
		'Sau khi đăng ký thành công, BTC sẽ liên hệ để thêm bạn vào nhóm chat Dealer FUVE và thông báo chi tiết về thời gian check-in & set-up.',
	]

	return (
		<CollapsibleScroll initialOpen>
			<h3 className="scroll-title pt-5 josefin bg-[url('/textures/asfalt-dark.png')] bg-scroll-title bg-clip-text text-transparent">
				QUY ĐỊNH GIAN HÀNG
			</h3>
			<Separator className='w-[95%] mx-auto' />
			<div className='text-scroll-text text-md font-sm'>
				<div>Additional rules can go here</div>
				{rules.map((rule, index) => (
					<p key={index}>{rule}</p>
				))}
			</div>
			<div className='pb-5' />
		</CollapsibleScroll>
	)
}

export default ArtBookRulesSection
