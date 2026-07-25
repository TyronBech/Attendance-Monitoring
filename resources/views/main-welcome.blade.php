@extends('layouts.welcome-layout')
@section('content')
<div id="main-welcome" class="flex items-center justify-center max-w-7xl my-16 md:my-24 lg:my-48 mx-auto px-4 sm:px-6 md:px-10">
  <div class="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 lg:gap-12">
    <img
      class="order-1 rounded-full w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 object-cover transition-transform duration-300 ease-in-out hover:scale-105"
      src="{{ $settings?->getOrgLogoBase64Attribute() }}"
      alt="{{ $settings?->org_name ?? 'School Name' }} Logo">
    <div class="order-2 flex flex-col items-center text-center">
      <h1 class="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-semibold text-black dark:text-white">
        {{ $settings?->org_name ?? 'School Name' }}
      </h1>
      <hr class="w-full max-w-xs h-px bg-gray-500 border-0 my-2 dark:bg-white">
      <h2 class="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-black dark:text-white">
        {{ config('app.name') }} - Library Management System
      </h2>
      <h4 class="text-base sm:text-lg md:text-base lg:text-lg font-semibold text-black my-4 dark:text-white">
        Developed by
      </h4>
      <h3 class="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-semibold text-black dark:text-white">
        OwlQuery
      </h3>
    </div>
    <div class="order-3">
      <img
        class="block dark:hidden w-40 sm:w-48 md:w-56 lg:w-60 h-auto transition-transform duration-300 ease-in-out hover:scale-105"
        src="{{ asset('img/OwlQuery.png') }}"
        alt="OwlQuery">
      <img
        class="hidden dark:block w-40 sm:w-48 md:w-56 lg:w-60 h-auto transition-transform duration-300 ease-in-out hover:scale-105"
        src="{{ asset('img/OwlQuery Dark.png') }}"
        alt="OwlQuery (Dark)">
    </div>
  </div>
</div>
<div id="about" class="min-h-screen flex items-center justify-center py-16 sm:py-24">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">
    <div class="md:w-1/3 shrink-0">
      <img
        class="mx-auto w-48 h-48 sm:w-56 sm:h-56 md:w-full md:h-auto object-contain"
        src="{{ asset('gif/OwlQuery.gif') }}"
        alt="OwlQuery Animated Logo">
    </div>
    <div class="text-center md:text-left">
      <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        About the {{ config('app.name') }}
      </h2>
      <p class="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300">
        A streamlined solution for managing books, users, and resources. It offers efficient cataloging, borrowing, and returning processes, enhancing user experience and library operations.
      </p>
      <p class="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300">
        With features like inventory management, user accounts, and reporting, it simplifies library administration and improves accessibility to information.
      </p>
    </div>
  </div>
</div>
<div id="services" class="min-h-screen flex flex-col justify-center py-16 sm:py-24">
  <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-center text-gray-900 dark:text-white mb-12">
    Our Services
  </h2>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 hover: transition- duration-300 shadow-md">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Book Management</h3>
      <p class="text-gray-600 dark:text-gray-300">
        Efficiently catalog and manage your library's book collection with easy-to-use tools for adding, updating, and organizing books.
      </p>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 hover: transition- duration-300 shadow-md">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Accounts</h3>
      <p class="text-gray-600 dark:text-gray-300">
        Create and manage user accounts for library members, allowing them to borrow books and access library resources seamlessly.
      </p>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 hover: transition- duration-300 shadow-md">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reporting and Analytics</h3>
      <p class="text-gray-600 dark:text-gray-300">
        Gain valuable insights into library usage and performance with detailed reports and analytics tools.
      </p>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 hover: transition- duration-300 shadow-md">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Inventory Management</h3>
      <p class="text-gray-600 dark:text-gray-300">
        Keep track of inventory levels, manage stock, and ensure availability of books for users.
      </p>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 hover: transition- duration-300 shadow-md">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Borrowing and Returning</h3>
      <p class="text-gray-600 dark:text-gray-300">
        Simplify the borrowing and returning process with an intuitive interface for both users and library staff.
      </p>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 hover: transition- duration-300 shadow-md">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Security and Authentication</h3>
      <p class="text-gray-600 dark:text-gray-300">
        Implement robust security measures to protect library data and user accounts from unauthorized access.
      </p>
    </div>
  </div>
</div>
@endsection