using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;

namespace ConstructMate.Infrastructure.StatusCodeGuard;

/// <summary>
/// Helper methods to verify conditions when running code
/// </summary>
[DebuggerStepThrough]
public class StatusCodeGuard
{
    /// <summary>
    /// Helper methods to efficiently throw exceptions
    /// </summary>
    /// <remarks>
    /// "... using the ThrowHelper pattern results in more compact and faster code"
    /// https://learn.microsoft.com/en-us/dotnet/communitytoolkit/diagnostics/throwhelper
    /// </remarks>
    [StackTraceHidden]
    private static class ThrowHelper
    {
        /// <summary>
        /// Throws a new <see cref="StatusCodeException"/>
        /// </summary>
        /// <exception cref="StatusCodeException">Thrown with errorCode and error message parameter</exception>
        [DoesNotReturn]
        public static void ThrowStatusCodeException(int errorCode, string message)
        {
            throw new StatusCodeException(errorCode, message);
        }
    }

    // There can be more methods added when needed

    /// <summary>
    /// Asserts that the input value is not <see langword="null"/>
    /// </summary>
    /// <typeparam name="T">The type of reference value type being tested</typeparam>
    /// <param name="value">The input value to test</param>
    /// <param name="statusCode">Error status code to include with thrown exception</param>
    /// <param name="message">Error message</param>
    /// <exception cref="StatusCodeException">Thrown if <paramref name="value"/> is <see langword="null"/></exception>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void IsNotNull<T>([NotNull] T? value, int statusCode, string message = "")
    {
        if (value is not null) return;

        ThrowHelper.ThrowStatusCodeException(statusCode, message);
    }

    /// <summary>
    /// Asserts that the input value is not <see langword="null"/>
    /// </summary>
    /// <typeparam name="T">The type of reference value type being tested</typeparam>
    /// <param name="value">The input value to test</param>
    /// <param name="statusCode">Error status code to include with thrown exception</param>
    /// <param name="message">Error message</param>
    /// <exception cref="StatusCodeException">Thrown if <paramref name="value"/> is <see langword="null"/></exception>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void IsNotNull<T>([NotNull] T? value, int statusCode, string message = "")
        where T : struct
    {
        if (value is not null) return;

        ThrowHelper.ThrowStatusCodeException(statusCode, message);
    }

    /// <summary>
    /// Asserts that the input value is <see langword="null"/>
    /// </summary>
    /// <typeparam name="T">The type of reference value type being tested</typeparam>
    /// <param name="value">The input value to test</param>
    /// <param name="statusCode">Error status code to include with thrown exception</param>
    /// <param name="message">Error message</param>
    /// <exception cref="StatusCodeException">Thrown if <paramref name="value"/> is not <see langword="null"/></exception>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void IsNull<T>(T? value, int statusCode, string message = "")
    {
        if (value is null) return;

        ThrowHelper.ThrowStatusCodeException(statusCode, message);
    }

    /// <summary>
    /// Asserts that the input value is <see langword="null"/>
    /// </summary>
    /// <typeparam name="T">The type of reference value type being tested</typeparam>
    /// <param name="value">The input value to test</param>
    /// <param name="statusCode">Error status code to include with thrown exception</param>
    /// <param name="message">Error message</param>
    /// <exception cref="StatusCodeException">Thrown if <paramref name="value"/> is not <see langword="null"/></exception>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void IsNull<T>(T? value, int statusCode, string message = "")
        where T : struct
    {
        if (value is null) return;

        ThrowHelper.ThrowStatusCodeException(statusCode, message);
    }

    /// <summary>
    /// Asserts that the input value must be <see langword="true"/>
    /// </summary>
    /// <param name="value">The <see cref="bool"/> value to test</param>
    /// <param name="statusCode">Error status code to include with thrown exception</param>
    /// <param name="message">Error message</param>
    /// <exception cref="StatusCodeException">Thrown if <paramref name="value"/> is <see langword="false"/></exception>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void IsTrue([DoesNotReturnIf(false)] bool value, int statusCode, string message = "")
    {
        if (value) return;

        ThrowHelper.ThrowStatusCodeException(statusCode, message);
    }

    /// <summary>
    /// Asserts that the input value must be false
    /// </summary>
    /// <param name="value">The <see cref="bool"/> value to test</param>
    /// <param name="statusCode">Error status code to include with thrown exception</param>
    /// <param name="message">Error message</param>
    /// <exception cref="StatusCodeException">Thrown if <paramref name="value"/> is true</exception>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void IsFalse([DoesNotReturnIf(true)] bool value, int statusCode, string message = "")
    {
        if (!value) return;

        ThrowHelper.ThrowStatusCodeException(statusCode, message);
    }

    /// <summary>
    /// Asserts that a collection is not null or empty
    /// </summary>
    /// <typeparam name="T">The type of values in <paramref name="collection"/></typeparam>
    /// <param name="collection">The collection to test</param>
    /// <param name="statusCode">Error status code to include with thrown exception</param>
    /// <param name="message">Error message</param>
    /// <exception cref="StatusCodeException">Thrown if <paramref name="collection"/> is null or empty</exception>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void IsNotNullOrEmpty<T>(IEnumerable<T> collection, int statusCode, string message = "")
    {
        if (collection != null && collection.Any()) return;

        ThrowHelper.ThrowStatusCodeException(statusCode, message);
    }

    /// <summary>
    /// Asserts that the input value must be equal to a specified value
    /// </summary>
    /// <typeparam name="T">The type of input values to compare</typeparam>
    /// <param name="value">The input <typeparamref name="T"/> value to test</param>
    /// <param name="target">The target <typeparamref name="T"/> value to test for</param>
    /// <param name="statusCode">Error status code to include with thrown exception</param>
    /// <param name="message">Error message</param>
    /// <exception cref="StatusCodeException">Thrown if <paramref name="value"/> is != <paramref name="target"/></exception>
    /// <remarks>The method is generic to avoid boxing the parameters, if they are value types</remarks>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void IsEqualTo<T>(T value, T target, int statusCode, string message = "")
        where T : notnull, IEquatable<T>
    {
        if (value.Equals(target)) return;

        ThrowHelper.ThrowStatusCodeException(statusCode, message);
    }

    /// <summary>
    /// Asserts that the input value must be not equal to a specified value
    /// </summary>
    /// <typeparam name="T">The type of input values to compare</typeparam>
    /// <param name="value">The input <typeparamref name="T"/> value to test</param>
    /// <param name="target">The target <typeparamref name="T"/> value to test for</param>
    /// <param name="statusCode">Error status code to include with thrown exception</param>
    /// <param name="message">Error message</param>
    /// <exception cref="StatusCodeException">Thrown if <paramref name="value"/> is == <paramref name="target"/></exception>
    /// <remarks>The method is generic to avoid boxing the parameters, if they are value types</remarks>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void IsNotEqualTo<T>(T value, T target, int statusCode, string message = "")
        where T : notnull, IEquatable<T>
    {
        if (!value.Equals(target)) return;

        ThrowHelper.ThrowStatusCodeException(statusCode, message);
    }

    /// <summary>
    /// Asserts that the input value must be less than a specified value
    /// </summary>
    /// <typeparam name="T">The type of input values to compare</typeparam>
    /// <param name="value">The input <typeparamref name="T"/> value to test</param>
    /// <param name="max">The exclusive maximum <typeparamref name="T"/> value that is accepted</param>
    /// <param name="statusCode">Error status code to include with thrown exception</param>
    /// <param name="message">Error message</param>
    /// <exception cref="StatusCodeException">Thrown if <paramref name="value"/> is >= <paramref name="max"/></exception>
    /// <remarks>The method is generic to avoid boxing the parameters, if they are value types</remarks>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void IsLessThan<T>(T value, T max, int statusCode, string message = "")
        where T : notnull, IComparable<T>
    {
        if (value.CompareTo(max) < 0) return;

        ThrowHelper.ThrowStatusCodeException(statusCode, message);
    }

    /// <summary>
    /// Asserts that the input value must be less than or equal to a specified value
    /// </summary>
    /// <typeparam name="T">The type of input values to compare</typeparam>
    /// <param name="value">The input <typeparamref name="T"/> value to test</param>
    /// <param name="max">The inclusive maximum <typeparamref name="T"/> value that is accepted</param>
    /// <param name="statusCode">Error status code to include with thrown exception</param>
    /// <param name="message">Error message</param>
    /// <exception cref="StatusCodeException">Thrown if <paramref name="value"/> is > <paramref name="max"/></exception>
    /// <remarks>The method is generic to avoid boxing the parameters, if they are value types</remarks>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void IsLessThanOrEqualTo<T>(T value, T max, int statusCode, string message = "")
        where T : notnull, IComparable<T>
    {
        if (value.CompareTo(max) <= 0) return;

        ThrowHelper.ThrowStatusCodeException(statusCode, message);
    }

    /// <summary>
    /// Asserts that the input value must be greater than a specified value
    /// </summary>
    /// <typeparam name="T">The type of input values to compare</typeparam>
    /// <param name="value">The input <typeparamref name="T"/> value to test</param>
    /// <param name="min">The exclusive minimum <typeparamref name="T"/> value that is accepted</param>
    /// <param name="statusCode">Error status code to include with thrown exception</param>
    /// <param name="message">Error message</param>
    /// <exception cref="StatusCodeException">Thrown if <paramref name="value"/> is &lt;= <paramref name="min"/></exception>
    /// <remarks>The method is generic to avoid boxing the parameters, if they are value types</remarks>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void IsGreaterThan<T>(T value, T min, int statusCode, string message = "")
        where T : notnull, IComparable<T>
    {
        if (value.CompareTo(min) > 0) return;

        ThrowHelper.ThrowStatusCodeException(statusCode, message);
    }

    /// <summary>
    /// Asserts that the input value must be greater than or equal to a specified value
    /// </summary>
    /// <typeparam name="T">The type of input values to compare</typeparam>
    /// <param name="value">The input <typeparamref name="T"/> value to test</param>
    /// <param name="min">The inclusive minimum <typeparamref name="T"/> value that is accepted</param>
    /// <param name="statusCode">Error status code to include with thrown exception</param>
    /// <param name="message">Error message</param>
    /// <exception cref="StatusCodeException">Thrown if <paramref name="value"/> is &lt; <paramref name="min"/></exception>
    /// <remarks>The method is generic to avoid boxing the parameters, if they are value types</remarks>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void IsGreaterThanOrEqualTo<T>(T value, T min, int statusCode, string message = "")
        where T : notnull, IComparable<T>
    {
        if (value.CompareTo(min) >= 0) return;

        ThrowHelper.ThrowStatusCodeException(statusCode, message);
    }
}
