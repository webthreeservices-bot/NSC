import React from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon, LucideIcon, MinusIcon } from 'lucide-react';
import { Badge } from './ui/badge';

function PricingTable({ className, ...props }: React.ComponentProps<'table'>) {
	return (
		<div
			data-slot="table-container"
			className="relative w-full overflow-x-auto"
		>
			<table className={cn('w-full text-sm', className)} {...props} />
		</div>
	);
}

function PricingTableHeader({ ...props }: React.ComponentProps<'thead'>) {
	return <thead data-slot="table-header" {...props} />;
}

function PricingTableBody({
	className,
	...props
}: React.ComponentProps<'tbody'>) {
	return (
		<tbody
			data-slot="table-body"
			className={cn('[&_tr]:divide-x [&_tr]:border-b [&_tr]:divide-gray-800 text-white', className)}
			{...props}
		/>
	);
}

function PricingTableRow({ className, ...props }: React.ComponentProps<'tr'>) {
	return <tr data-slot="table-row" className={cn('border-gray-800', className)} {...props} />;
}

function PricingTableCell({
	className,
	children,
	...props
}: React.ComponentProps<'td'> & { children: boolean | string }) {
	return (
		<td
			data-slot="table-cell"
			className={cn('p-4 align-middle whitespace-nowrap', className)}
			{...props}
		>
			{children === true ? (
				<CheckIcon aria-hidden="true" className="size-4 text-[#00ff00]" />
			) : children === false ? (
				<MinusIcon
					aria-hidden="true"
					className="text-gray-500 size-4"
				/>
			) : (
				children
			)}
		</td>
	);
}

function PricingTableHead({ className, ...props }: React.ComponentProps<'th'>) {
	return (
		<th
			data-slot="table-head"
			className={cn(
				'p-3 text-left align-middle font-medium whitespace-nowrap text-[#00ff00]',
				className,
			)}
			{...props}
		/>
	);
}

function PricingTablePlan({
	name,
	badge,
	price,
	compareAt,
	icon: Icon,
	children,
	className,
	...props
}: React.ComponentProps<'div'> & PricingPlanType) {
	return (
		<div
			className={cn(
				'bg-black supports-[backdrop-filter]:bg-black/80 relative h-full overflow-hidden rounded-lg border border-gray-800 p-4 font-normal backdrop-blur-xs hover:border-[#00ff00]/30 transition-all',
				className,
			)}
			{...props}
		>
			<div className="flex items-center gap-2">
				<div className="flex items-center justify-center rounded-full bg-[#00ff00]/20 p-1.5">
					{Icon && <Icon className="h-4 w-4 text-[#00ff00]" />}
				</div>
				<h3 className="font-mono text-sm text-white uppercase">{name}</h3>
				<Badge
					variant="secondary"
					className="ml-auto rounded-full border border-[#00ff00]/20 bg-[#00ff00]/10 text-[#00ff00] px-2 py-0.5 text-[10px] font-normal"
				>
					{badge}
				</Badge>
			</div>

			<div className="mt-4 flex items-baseline gap-2">
				<span className="text-3xl font-bold text-white">{price}</span>
				{compareAt && (
					<span className="text-gray-500 text-sm line-through">
						{compareAt}
					</span>
				)}
			</div>
			<div className="relative z-10 mt-4">{children}</div>
		</div>
	);
}

type PricingPlanType = {
	name: string;
	icon: LucideIcon;
	badge: string;
	price: string;
	compareAt?: string;
};

type FeatureValue = boolean | string;

type FeatureItem = {
	label: string;
	values: FeatureValue[];
};

export {
	type PricingPlanType,
	type FeatureValue,
	type FeatureItem,
	PricingTable,
	PricingTableHeader,
	PricingTableBody,
	PricingTableRow,
	PricingTableHead,
	PricingTableCell,
	PricingTablePlan,
};
