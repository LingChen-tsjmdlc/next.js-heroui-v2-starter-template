"use client";

/**
 * Navbar 导航栏组件
 * 包含：品牌 Logo、导航链接、搜索框、主题切换、社交链接、移动端菜单
 */

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/react";
import { Button } from "@heroui/react";
import { Kbd } from "@heroui/react";
import { Link } from "@heroui/react";
import { Input } from "@heroui/react";
import { link as linkStyles } from "@heroui/react";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, SearchIcon, Logo } from "@/components/icons";

export const Navbar = () => {
  // 搜索输入框组件（桌面端显示）
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* 左侧区域：Logo + 导航链接 */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">{siteConfig.name}</p>
          </NextLink>
        </NavbarBrand>
        {/* 桌面端水平导航菜单 */}
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      {/* 右侧区域：社交链接 + 搜索 + 操作按钮 */}
      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        {/* 社交 / 外部链接 */}
        <NavbarItem className="hidden sm:flex gap-2">
          {siteConfig.links.github && (
            <Link isExternal href={siteConfig.links.github} title="GitHub">
              <GithubIcon className="text-default-500" />
            </Link>
          )}
          <ThemeSwitch />
        </NavbarItem>
        {/* 搜索框 */}
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
      </NavbarContent>

      {/* 移动端区域（小屏显示） */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        {siteConfig.links.github && (
          <Link isExternal href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link>
        )}
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      {/* 移动端展开的汉堡菜单 */}
      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <Link
                color={index === siteConfig.navItems.length - 1 ? "primary" : "foreground"}
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
